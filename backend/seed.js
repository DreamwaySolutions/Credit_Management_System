import bcrypt from 'bcryptjs';
import { pool } from './config/db.js';

export const initialCustomers = [
  "Krishna Veni General Stores",
  "SIRI GENERAL STORES",
  "Nava Durga General stores",
  "sai krishna kirana And General stores",
  "Sri Kanaka durga general stores",
  "Vijayalakshmi kirana",
  "Sri devi Rajeswari kirana",
  "Sri Lakshmi narayana kirana",
  "Naresh Kirana And General Stores",
  "Ravi Ganesh General Stores",
  "Vijetha Super market private limited",
  "Vasavi General stores",
  "Sri lakshmi durga oil And general merchant",
  "Prakash General stores",
  "Sri Venkata lakshmi marketing",
  "Sri Veerabhadhra Enterprise",
  "Raju Kirana And Generals",
  "Sri Ambica Pure oilAnd General stores",
  "V Mart Super Market",
  "Sri Priya Rice and General Stores",
  "Gayathri super market",
  "Pavan General stores",
  "Phani General Stores",
  "Sri Srinivasa General Stores",
  "Sri Lakshmi Ganapati General Stores",
  "MS Mart",
  "kowsik kirana and general stores",
  "Sri Vasavi durga lalitha kirana And general stores",
  "Sri parameswari kirana",
  "Srikar kirana And general stores",
  "Sri Dhana lakshmi enterprise",
  "Sri Satya Srinivasa Kirana And Genaral Stores",
  "SRI RAJASTHAN KIRANA AND GENERAL STORES",
  "Sri Veerabhadra General Stores",
  "Godavari Super Market",
  "Sri Dattatreya Kirana Stores",
  "venkata naga prasad kirana",
  "SRI KALKI BHAGAVAN KIRANA AND GENERAL STORES",
  "Sri kanakamahalakshmi kirana",
  "Mahalakshmi kirana",
  "Devi kirana",
  "Sri Chanda kirana And General Stores",
  "Quality General Stores",
  "Sri Naga Lakshmi Narayana traders",
  "Bhagya Lakshmi Kirana And General",
  "Sri Raja Rajeswari RiceAnd General Stores",
  "KCMACC STORES",
  "Madan Gopal Trading company",
  "Sri Sarva Lakshmi Agencies",
  "Venkat trdaers",
  "Sri Nukalamma narayana kirana",
  "Sri Katsyayani general stores",
  "Surya Ganesh kirana And General stores",
  "Annapurna Marketing",
  "Vasu General Stores",
  "Madan Gopal Bhadri Narayana Kirana And General Marchents",
  "Singamsetti Kedhareswara Rao Kirana And Genaral Stores",
  "Sri Sai Genaral Stores",
  "Pentapati venkateswara rao kirana marchents",
  "Veeravenkata Sai Kirana",
  "Sri Srinivasa Kirana And Genaral Stores",
  "SRI BALAJI GENERAL STORES",
  "Kanyaka Parameswari General Stores",
  "RAJASTHAN KIRANA And GENERAL STORES",
  "Nallam Venkata rao",
  "K Dhanraj General Stores",
  "Reddy gari Masala Shop",
  "Venkata Ramana kirana general",
  "Sri satya deva oil and general stores",
  "Sri Dhanalakshmi photo frames",
  "Om Manikanta Kirana And General Merchant",
  "sri vigneswara general stores",
  "sri bramarambika general stores",
  "Sri Lakshmi General Stores",
  "Padmavathi Departmental Stores",
  "Sri Swamy kirana And General Stores",
  "Siva Raghava Department store",
  "Sri ganesh sai krishna kirana And General stores",
  "Sri Vigneswara Rice And General stores",
  "Ram kirana And G/S",
  "Sri tirumala general stores",
  "Appanna Kamaraju",
  "Raj Kirana & General stores",
  "Satyanandha kirana And General Stores"
];

export async function seedDatabase() {
  try {
    const connection = await pool.getConnection();

    // 1. Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('superadmin', 'admin') NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        customer_number INT NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS chits (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        customer_id BIGINT NOT NULL,
        chit_number INT NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        due_amount DECIMAL(12, 2) NOT NULL,
        payment_type VARCHAR(50) DEFAULT 'Cash',
        type ENUM('due', 'collection') DEFAULT 'due',
        status ENUM('active', 'deleted', 'completed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        customer_id BIGINT NOT NULL,
        chit_id BIGINT NULL,
        chit_number INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        payment_type VARCHAR(50) DEFAULT 'Cash',
        type ENUM('payment', 'deleted_with_due') NOT NULL DEFAULT 'payment',
        created_by VARCHAR(100) DEFAULT 'satish',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);


    await connection.query(`
      CREATE TABLE IF NOT EXISTS saved_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        customerCount INT NOT NULL DEFAULT 0,
        totalAmount DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
        customersData LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Safe Auto-migration for existing production tables
    try {
      await connection.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'deactivated') NOT NULL DEFAULT 'active'");
    } catch (migrationErr) {
      // Column already exists
    }

    try {
      await connection.query("ALTER TABLE chits ADD COLUMN line VARCHAR(20) DEFAULT 'Line 1'");
    } catch (migrationErr) {
      // Column already exists
    }

    try {
      await connection.query("ALTER TABLE saved_records ADD COLUMN line VARCHAR(20) DEFAULT 'Line 1'");
    } catch (migrationErr) {
      // Column already exists
    }

    try {
      await connection.query('ALTER TABLE customers MODIFY id BIGINT AUTO_INCREMENT');
      await connection.query('ALTER TABLE chits MODIFY id BIGINT AUTO_INCREMENT');
      await connection.query('ALTER TABLE chits MODIFY customer_id BIGINT');
      await connection.query('ALTER TABLE transactions MODIFY id BIGINT AUTO_INCREMENT');
      await connection.query('ALTER TABLE transactions MODIFY customer_id BIGINT');
      await connection.query('ALTER TABLE transactions MODIFY chit_id BIGINT');
    } catch (migrationErr) {
      // Already upgraded or foreign key constraint
    }

    // Multi-tenant user_id migrations
    try {
      await connection.query("ALTER TABLE customers ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE customers DROP INDEX customer_number");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE customers ADD INDEX idx_cust_user (user_id, customer_number)");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE chits ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE saved_records ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1");
    } catch (e) {}

    try {
      await connection.query("ALTER TABLE transactions ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1");
    } catch (e) {}

    // 2. Seed Users

    const satishHash = await bcrypt.hash('satish123', 10);
    const superHash = await bcrypt.hash('admin123', 10);

    await connection.query(`
      INSERT INTO users (username, password, name, role)
      VALUES (?, ?, ?, 'admin'), (?, ?, ?, 'superadmin')
      ON DUPLICATE KEY UPDATE id=id;
    `, ['satish', satishHash, 'Satish Sir', 'superadmin', superHash, 'Super Admin']);

    // Ensure all existing unassigned customers, chits, and records are strictly linked to Satish
    try {
      const [satishRows] = await connection.query("SELECT id FROM users WHERE username = 'satish'");
      if (satishRows.length > 0) {
        const satishId = satishRows[0].id;
        await connection.query("UPDATE customers SET user_id = ? WHERE user_id IS NULL OR user_id = 0", [satishId]);
        await connection.query("UPDATE chits SET user_id = ? WHERE user_id IS NULL OR user_id = 0", [satishId]);
        await connection.query("UPDATE saved_records SET user_id = ? WHERE user_id IS NULL OR user_id = 0", [satishId]);
        await connection.query("UPDATE transactions SET user_id = ? WHERE user_id IS NULL OR user_id = 0", [satishId]);
      }
    } catch (e) {}

    // 3. Seed Customers if empty
    const [existingCust] = await connection.query('SELECT COUNT(*) as count FROM customers');
    if (existingCust[0].count === 0) {
      console.log('Seeding initial 84 customers...');
      for (let i = 0; i < initialCustomers.length; i++) {
        const custNum = i + 1;
        const name = initialCustomers[i];
        await connection.query(
          'INSERT INTO customers (customer_number, name) VALUES (?, ?)',
          [custNum, name]
        );
      }

      // Seed initial sample chits for Demo
      const [custRows] = await connection.query('SELECT id, customer_number FROM customers LIMIT 2');
      if (custRows.length >= 2) {
        // Customer 1: Krishna Veni General Stores -> Chit 1 (Due 5000), Chit 2 (Due 20000)
        await connection.query(
          'INSERT INTO chits (customer_id, chit_number, total_amount, due_amount) VALUES (?, 1, 15000, 5000), (?, 2, 20000, 20000)',
          [custRows[0].id, custRows[0].id]
        );

        // Customer 2: SIRI GENERAL STORES -> Chit 1 (Due 10000), Chit 2 (Due 15000)
        await connection.query(
          'INSERT INTO chits (customer_id, chit_number, total_amount, due_amount) VALUES (?, 1, 10000, 10000), (?, 2, 15000, 15000)',
          [custRows[1].id, custRows[1].id]
        );
      }
    }

    connection.release();
    console.log('Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('Database Seeding Error:', error);
  }
}

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
