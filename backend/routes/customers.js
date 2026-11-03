import express from 'express';
import { pool } from '../config/db.js';
import { inMemoryCustomers, deleteInMemoryCustomer, updateInMemoryCustomer } from '../config/store.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication middleware on all customer routes
router.use(authenticateUser);

// GET /api/customers - List customers isolated to the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE user_id = ? ORDER BY customer_number ASC',
      [userId]
    );

    if (!customers || customers.length === 0) {
      return res.json([]);
    }

    const customerIds = customers.map(c => c.id);
    const [chits] = await pool.query(
      "SELECT * FROM chits WHERE customer_id IN (?) AND status = 'active' ORDER BY chit_number ASC",
      [customerIds]
    );

    // Group chits under respective customers with numeric casting
    const customerList = customers.map(c => ({
      ...c,
      chits: chits
        .filter(ch => ch.customer_id === c.id)
        .map(ch => ({
          ...ch,
          total_amount: Number(ch.total_amount) || 0,
          due_amount: Number(ch.due_amount) || 0,
          payment_type: ch.payment_type || 'Cash',
          type: ch.type || 'due',
          line: ch.line || 'Line 1'
        }))
    }));

    res.json(customerList);
  } catch (error) {
    console.warn('DB customers query fallback to memory:', error.message);
    const userId = req.user?.id || 1;
    if (userId === 1) {
      res.json(inMemoryCustomers);
    } else {
      res.json([]);
    }
  }
});

// POST /api/customers - Create customer for authenticated user
router.post('/', async (req, res) => {
  try {
    const { name, customer_number } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const userId = req.user?.id || 1;
    let finalNumber = customer_number;

    try {
      if (!finalNumber) {
        const [maxRow] = await pool.query(
          'SELECT MAX(customer_number) as maxNum FROM customers WHERE user_id = ?',
          [userId]
        );
        finalNumber = (maxRow[0]?.maxNum || 0) + 1;
      }

      const [result] = await pool.query(
        'INSERT INTO customers (customer_number, name, user_id) VALUES (?, ?, ?)',
        [finalNumber, name, userId]
      );

      const newCustomer = {
        id: result.insertId,
        customer_number: finalNumber,
        name,
        user_id: userId,
        chits: []
      };

      if (userId === 1) {
        inMemoryCustomers.push(newCustomer);
      }

      return res.status(201).json(newCustomer);
    } catch (dbErr) {
      console.warn('DB customer insert fallback:', dbErr.message);
      if (!finalNumber) {
        finalNumber = inMemoryCustomers.length + 1;
      }
      const newCustomer = {
        id: Date.now(),
        customer_number: finalNumber,
        name,
        user_id: userId,
        chits: []
      };
      if (userId === 1) {
        inMemoryCustomers.push(newCustomer);
      }
      return res.status(201).json(newCustomer);
    }
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/customers/:id - Edit Customer Name or Customer Number
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customer_number } = req.body;
    const userId = req.user?.id || 1;

    try {
      if (name !== undefined && customer_number !== undefined) {
        await pool.query('UPDATE customers SET name = ?, customer_number = ? WHERE id = ? AND user_id = ?', [name, customer_number, id, userId]);
      } else if (name !== undefined) {
        await pool.query('UPDATE customers SET name = ? WHERE id = ? AND user_id = ?', [name, id, userId]);
      } else if (customer_number !== undefined) {
        await pool.query('UPDATE customers SET customer_number = ? WHERE id = ? AND user_id = ?', [customer_number, id, userId]);
      }
    } catch (dbErr) {
      console.warn('DB update customer fallback:', dbErr.message);
    }

    if (userId === 1) {
      updateInMemoryCustomer(id, { name, customer_number });
    }
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE /api/customers/:id - Delete Customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;

    try {
      // Find the customer first ensuring ownership
      const [rows] = await pool.query(
        'SELECT id, customer_number FROM customers WHERE (id = ? OR customer_number = ?) AND user_id = ?',
        [id, id, userId]
      );
      if (rows.length > 0) {
        for (const row of rows) {
          await pool.query('DELETE FROM transactions WHERE customer_id = ? AND user_id = ?', [row.id, userId]);
          await pool.query('DELETE FROM chits WHERE customer_id = ?', [row.id]);
          await pool.query('DELETE FROM customers WHERE id = ? AND user_id = ?', [row.id, userId]);
          if (userId === 1) deleteInMemoryCustomer(row.id);
        }
      } else {
        await pool.query('DELETE FROM transactions WHERE customer_id = ? AND user_id = ?', [id, userId]);
        await pool.query('DELETE FROM chits WHERE customer_id = ?', [id]);
        await pool.query('DELETE FROM customers WHERE id = ? AND user_id = ?', [id, userId]);
        if (userId === 1) deleteInMemoryCustomer(id);
      }
    } catch (dbErr) {
      console.warn('DB delete customer fallback:', dbErr.message);
      if (userId === 1) deleteInMemoryCustomer(id);
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
