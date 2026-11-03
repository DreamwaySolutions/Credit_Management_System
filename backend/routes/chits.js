import express from 'express';
import { pool } from '../config/db.js';
import { inMemoryCustomers } from '../config/store.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateUser);

// Auto-migration helper: ensure columns exist
async function ensureChitColumns() {
  try {
    await pool.query("ALTER TABLE chits ADD COLUMN payment_type VARCHAR(50) DEFAULT 'Cash'");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE chits ADD COLUMN type ENUM('due', 'collection') DEFAULT 'due'");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE chits ADD COLUMN line VARCHAR(20) DEFAULT 'Line 1'");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE chits ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1");
  } catch (e) {}
}

ensureChitColumns();

// POST /api/chits - Create a new Chit/Credit Card
router.post('/', async (req, res) => {
  try {
    const { customer_id, chit_number, amount, payment_type, type, line } = req.body;
    const userId = req.user?.id || 1;

    if (!customer_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Customer ID and positive amount are required' });
    }

    let finalChitNum = chit_number ? Number(chit_number) : null;
    const chitType = type || 'due';
    const chitLine = line || 'Line 1';
    const paymentMode = payment_type || (chitType === 'due' ? null : 'UPI');

    try {
      if (!finalChitNum) {
        const [rows] = await pool.query(
          'SELECT MAX(chit_number) as maxChit FROM chits WHERE customer_id = ?',
          [customer_id]
        );
        finalChitNum = (rows[0]?.maxChit || 0) + 1;
      }

      const [result] = await pool.query(
        'INSERT INTO chits (customer_id, chit_number, total_amount, due_amount, payment_type, type, line, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, "active", ?)',
        [customer_id, finalChitNum, amount, amount, paymentMode, chitType, chitLine, userId]
      );

      const newChit = {
        id: result.insertId,
        customer_id: Number(customer_id),
        chit_number: finalChitNum,
        total_amount: Number(amount),
        due_amount: Number(amount),
        payment_type: paymentMode,
        type: chitType,
        line: chitLine,
        status: 'active',
        user_id: userId
      };

      if (userId === 1) {
        const cust = inMemoryCustomers.find(c => c.id === Number(customer_id));
        if (cust) {
          if (!cust.chits) cust.chits = [];
          cust.chits.push(newChit);
        }
      }

      res.status(201).json(newChit);
    } catch (dbErr) {
      console.warn('DB create chit fallback:', dbErr.message);
      const cust = inMemoryCustomers.find(c => c.id === Number(customer_id));
      if (!finalChitNum) {
        const existingChits = cust?.chits || [];
        const maxChit = existingChits.length > 0 ? Math.max(...existingChits.map(ch => Number(ch.chit_number) || 0)) : 0;
        finalChitNum = maxChit + 1;
      }

      const newChit = {
        id: Date.now(),
        customer_id: Number(customer_id),
        chit_number: finalChitNum || 1,
        total_amount: Number(amount),
        due_amount: Number(amount),
        payment_type: paymentMode,
        type: chitType,
        line: chitLine,
        status: 'active',
        user_id: userId
      };

      if (cust && userId === 1) {
        if (!cust.chits) cust.chits = [];
        cust.chits.push(newChit);
      }

      res.status(201).json(newChit);
    }
  } catch (error) {
    console.error('Create chit error:', error);
    res.status(500).json({ error: 'Failed to create chit' });
  }
});

// POST /api/chits/clear-collection - Clear all active collection entries for this authenticated user only
router.post('/clear-collection', async (req, res) => {
  try {
    const { line } = req.body || {};
    const userId = req.user?.id || 1;

    try {
      if (line) {
        await pool.query(
          "UPDATE chits c JOIN customers cust ON c.customer_id = cust.id SET c.status = 'completed' WHERE c.type = 'collection' AND cust.user_id = ? AND c.line = ? AND c.status = 'active'",
          [userId, line]
        );
      } else {
        await pool.query(
          "UPDATE chits c JOIN customers cust ON c.customer_id = cust.id SET c.status = 'completed' WHERE c.type = 'collection' AND cust.user_id = ? AND c.status = 'active'",
          [userId]
        );
      }
    } catch (dbErr) {
      console.warn('DB clear collection fallback:', dbErr.message);
    }

    if (userId === 1) {
      inMemoryCustomers.forEach(c => {
        if (c.chits) {
          c.chits = c.chits.filter(ch => ch.type !== 'collection' || (line && ch.line !== line));
        }
      });
    }

    res.json({ message: line ? `All ${line} collection entries cleared successfully` : 'All collection entries cleared successfully' });
  } catch (error) {
    console.error('Clear collection error:', error);
    res.status(500).json({ error: 'Failed to clear collection entries' });
  }
});

// POST /api/chits/clear-dues - Clear all active due entries for this authenticated user only
router.post('/clear-dues', async (req, res) => {
  try {
    const { line } = req.body || {};
    const userId = req.user?.id || 1;

    try {
      if (line) {
        await pool.query(
          "UPDATE chits c JOIN customers cust ON c.customer_id = cust.id SET c.status = 'completed' WHERE (c.type = 'due' OR c.type IS NULL) AND cust.user_id = ? AND c.line = ? AND c.status = 'active'",
          [userId, line]
        );
      } else {
        await pool.query(
          "UPDATE chits c JOIN customers cust ON c.customer_id = cust.id SET c.status = 'completed' WHERE (c.type = 'due' OR c.type IS NULL) AND cust.user_id = ? AND c.status = 'active'",
          [userId]
        );
      }
    } catch (dbErr) {
      console.warn('DB clear dues fallback:', dbErr.message);
    }

    if (userId === 1) {
      inMemoryCustomers.forEach(c => {
        if (c.chits) {
          c.chits = c.chits.filter(ch => ch.type === 'collection' || (line && ch.line !== line));
        }
      });
    }

    res.json({ message: line ? `All ${line} due entries cleared successfully` : 'All due entries cleared successfully' });
  } catch (error) {
    console.error('Clear dues error:', error);
    res.status(500).json({ error: 'Failed to clear due entries' });
  }
});

// DELETE /api/chits/:id - Delete chit
router.delete('/:id', async (req, res) => {
  try {
    const chitId = req.params.id;
    const { created_by } = req.body;
    const userId = req.user?.id || 1;

    try {
      const [chitRows] = await pool.query(
        'SELECT c.* FROM chits c JOIN customers cust ON c.customer_id = cust.id WHERE c.id = ? AND cust.user_id = ?',
        [chitId, userId]
      );
      if (chitRows.length > 0) {
        const chit = chitRows[0];
        const [custRows] = await pool.query('SELECT name FROM customers WHERE id = ?', [chit.customer_id]);
        const customerName = custRows[0]?.name || 'Unknown Customer';

        await pool.query(
          `INSERT INTO transactions (customer_id, chit_id, chit_number, customer_name, amount, payment_type, type, created_by, user_id)
           VALUES (?, ?, ?, ?, ?, 'N/A', 'deleted_with_due', ?, ?)`,
          [chit.customer_id, chit.id, chit.chit_number, customerName, chit.due_amount, created_by || req.user?.username || 'satish', userId]
        );

        await pool.query('UPDATE chits SET status = "deleted" WHERE id = ?', [chitId]);
      }
    } catch (dbErr) {
      console.warn('DB delete chit fallback:', dbErr.message);
    }

    if (userId === 1) {
      inMemoryCustomers.forEach(c => {
        if (c.chits) {
          c.chits = c.chits.filter(ch => ch.id !== Number(chitId));
        }
      });
    }

    res.json({ message: 'Chit deleted successfully' });
  } catch (error) {
    console.error('Delete chit error:', error);
    res.status(500).json({ error: 'Failed to delete chit' });
  }
});

// PUT /api/chits/:id - Edit Chit Amount / Due Amount
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { due_amount, total_amount } = req.body;
    const userId = req.user?.id || 1;

    try {
      if (due_amount !== undefined && total_amount !== undefined) {
        await pool.query(
          'UPDATE chits c JOIN customers cust ON c.customer_id = cust.id SET c.due_amount = ?, c.total_amount = ? WHERE c.id = ? AND cust.user_id = ?',
          [due_amount, total_amount, id, userId]
        );
      } else if (due_amount !== undefined) {
        await pool.query(
          'UPDATE chits c JOIN customers cust ON c.customer_id = cust.id SET c.due_amount = ? WHERE c.id = ? AND cust.user_id = ?',
          [due_amount, id, userId]
        );
      }
    } catch (dbErr) {
      console.warn('DB update chit fallback:', dbErr.message);
    }

    if (userId === 1) {
      inMemoryCustomers.forEach(c => {
        if (c.chits) {
          c.chits = c.chits.map(ch =>
            ch.id === Number(id)
              ? { ...ch, due_amount: Number(due_amount), total_amount: total_amount !== undefined ? Number(total_amount) : ch.total_amount }
              : ch
          );
        }
      });
    }

    res.json({ message: 'Chit updated successfully' });
  } catch (error) {
    console.error('Update chit error:', error);
    res.status(500).json({ error: 'Failed to update chit' });
  }
});

export default router;
