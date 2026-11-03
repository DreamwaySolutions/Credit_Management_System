import express from 'express';
import { pool } from '../config/db.js';
import { inMemorySavedRecords, setInMemorySavedRecords } from '../config/store.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateUser);

// Auto-migration helper: ensure user_id column exists
async function ensureSavedRecordsColumns() {
  try {
    await pool.query("ALTER TABLE saved_records ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1");
  } catch (e) {}
}
ensureSavedRecordsColumns();

// GET /api/saved-records - List all saved snapshot records isolated to authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const [rows] = await pool.query(
      'SELECT * FROM saved_records WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const parsedRows = rows.map(r => {
      let rawCusts = [];
      try {
        rawCusts = typeof r.customersData === 'string' ? JSON.parse(r.customersData) : (r.customersData || []);
      } catch (e) {
        rawCusts = [];
      }

      const sanitizedCusts = rawCusts.map(c => ({
        ...c,
        customer_number: Number(c.customer_number),
        chits: (c.chits || []).map(ch => ({
          ...ch,
          due_amount: Number(ch.due_amount) || 0
        }))
      }));

      // Calculate pure numeric total to eliminate corrupt concatenated strings
      const calculatedTotal = sanitizedCusts.reduce(
        (tot, c) => tot + c.chits.reduce((sum, ch) => sum + (Number(ch.due_amount) || 0), 0),
        0
      );

      return {
        ...r,
        id: String(r.id),
        line: r.line || 'Line 1',
        savedAt: r.created_at,
        created_at: r.created_at,
        totalAmount: calculatedTotal,
        customerCount: sanitizedCusts.length,
        customers: sanitizedCusts
      };
    });
    res.json(parsedRows);
  } catch (dbErr) {
    console.warn('DB saved records query fallback:', dbErr.message);
    const userId = req.user?.id || 1;
    if (userId === 1) {
      res.json(inMemorySavedRecords);
    } else {
      res.json([]);
    }
  }
});

// POST /api/saved-records - Save new daily snapshot record for authenticated user
router.post('/', async (req, res) => {
  try {
    const { date, type, customerCount, totalAmount, customers, line } = req.body;
    const userId = req.user?.id || 1;

    if (!date || !type || !customers) {
      return res.status(400).json({ error: 'Date, type, and customers list are required' });
    }

    const recordLine = line || 'Line 1';

    const sanitizedCusts = customers.map(c => ({
      ...c,
      customer_number: Number(c.customer_number),
      chits: (c.chits || []).map(ch => ({
        ...ch,
        line: ch.line || recordLine,
        due_amount: Number(ch.due_amount) || 0
      }))
    }));

    const pureTotal = sanitizedCusts.reduce(
      (tot, c) => tot + c.chits.reduce((sum, ch) => sum + (Number(ch.due_amount) || 0), 0),
      0
    );

    const payloadCustomers = JSON.stringify(sanitizedCusts);

    try {
      // Check if a record already exists for this (date, type, line, user_id)
      const [existing] = await pool.query(
        'SELECT id FROM saved_records WHERE date = ? AND type = ? AND (line = ? OR line IS NULL) AND user_id = ?',
        [date, type, recordLine, userId]
      );

      let recordId;
      if (existing.length > 0) {
        recordId = existing[0].id;
        await pool.query(
          'UPDATE saved_records SET customerCount = ?, totalAmount = ?, customersData = ?, line = ?, created_at = NOW() WHERE id = ? AND user_id = ?',
          [sanitizedCusts.length, pureTotal, payloadCustomers, recordLine, recordId, userId]
        );
      } else {
        const [result] = await pool.query(
          'INSERT INTO saved_records (date, type, customerCount, totalAmount, customersData, line, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [date, type, sanitizedCusts.length, pureTotal, payloadCustomers, recordLine, userId]
        );
        recordId = result.insertId;
      }

      const newRecord = {
        id: String(recordId),
        date,
        type,
        line: recordLine,
        user_id: userId,
        customerCount: sanitizedCusts.length,
        totalAmount: pureTotal,
        customers: sanitizedCusts,
        savedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      if (userId === 1) {
        const filtered = inMemorySavedRecords.filter(r => !(r.date === date && r.type === type));
        setInMemorySavedRecords([newRecord, ...filtered]);
      }
      res.status(201).json(newRecord);
    } catch (dbErr) {
      console.warn('DB create saved record fallback:', dbErr.message);
      const newRecord = {
        id: String(Date.now()),
        date,
        type,
        line: recordLine,
        user_id: userId,
        customerCount: sanitizedCusts.length,
        totalAmount: pureTotal,
        customers: sanitizedCusts,
        savedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      if (userId === 1) {
        const filtered = inMemorySavedRecords.filter(r => !(r.date === date && r.type === type));
        setInMemorySavedRecords([newRecord, ...filtered]);
      }
      res.status(201).json(newRecord);
    }

  } catch (error) {
    console.error('Create saved record error:', error);
    res.status(500).json({ error: 'Failed to create saved record' });
  }
});

// DELETE /api/saved-records/:id - Delete a saved snapshot record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;

    try {
      if (typeof id === 'string' && id.includes('_')) {
        const parts = id.split('_');
        const type = parts[0];
        const date = parts.slice(1).join('_');
        await pool.query('DELETE FROM saved_records WHERE date = ? AND type = ? AND user_id = ?', [date, type, userId]);
      } else {
        await pool.query('DELETE FROM saved_records WHERE id = ? AND user_id = ?', [id, userId]);
      }
    } catch (dbErr) {
      console.warn('DB delete saved record fallback:', dbErr.message);
    }

    if (userId === 1) {
      setInMemorySavedRecords(
        inMemorySavedRecords.filter(r => {
          if (String(r.id) === String(id)) return false;
          if (typeof id === 'string' && id.includes('_')) {
            const parts = id.split('_');
            const type = parts[0];
            const date = parts.slice(1).join('_');
            if (r.date === date && r.type === type) return false;
          }
          return true;
        })
      );
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete saved record error:', error);
    res.status(500).json({ error: 'Failed to delete saved record' });
  }
});

// PUT /api/saved-records/:id/chits - Edit or delete chit within a saved record
router.put('/:id/chits', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, chitId, newDueAmount } = req.body;
    const userId = req.user?.id || 1;

    try {
      const [rows] = await pool.query('SELECT * FROM saved_records WHERE id = ? AND user_id = ?', [id, userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Saved record not found' });
      }

      const record = rows[0];
      let customers = typeof record.customersData === 'string' ? JSON.parse(record.customersData) : record.customersData;

      if (action === 'delete') {
        customers = customers.map(c => ({
          ...c,
          chits: c.chits.filter(ch => ch.id !== chitId)
        })).filter(c => c.chits.length > 0);
      } else if (action === 'edit' && newDueAmount !== undefined) {
        customers = customers.map(c => ({
          ...c,
          chits: c.chits.map(ch => ch.id === chitId ? { ...ch, due_amount: Number(newDueAmount) } : ch)
        }));
      }

      // Recalculate totals
      let newTotalAmount = 0;
      customers.forEach(c => {
        c.chits.forEach(ch => {
          newTotalAmount += Number(ch.due_amount);
        });
      });

      await pool.query(
        'UPDATE saved_records SET customerCount = ?, totalAmount = ?, customersData = ? WHERE id = ? AND user_id = ?',
        [customers.length, newTotalAmount, JSON.stringify(customers), id, userId]
      );

      res.json({ message: 'Saved record updated successfully', customers, totalAmount: newTotalAmount });
    } catch (dbErr) {
      console.warn('DB update saved record chit fallback:', dbErr.message);
      res.json({ message: 'Saved record updated in offline mode' });
    }
  } catch (error) {
    console.error('Update saved record chit error:', error);
    res.status(500).json({ error: 'Failed to update saved record chit' });
  }
});

export default router;
