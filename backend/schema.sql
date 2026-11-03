-- DreamWay Credit Management System MySQL Database Schema

CREATE DATABASE IF NOT EXISTS `dreamway_credit_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dreamway_credit_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('superadmin', 'admin') NOT NULL DEFAULT 'admin',
  `status` ENUM('active', 'deactivated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `customer_number` INT NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Chits / Credit Cards Table
CREATE TABLE IF NOT EXISTS `chits` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` BIGINT NOT NULL,
  `chit_number` INT NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `due_amount` DECIMAL(12, 2) NOT NULL,
  `payment_type` VARCHAR(50) DEFAULT 'Cash',
  `type` ENUM('due', 'collection') DEFAULT 'due',
  `status` ENUM('active', 'deleted', 'completed') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Transactions / History Table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` BIGINT NOT NULL,
  `chit_id` BIGINT NULL,
  `chit_number` INT NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `payment_type` VARCHAR(50) DEFAULT 'Cash',
  `type` ENUM('payment', 'deleted_with_due') NOT NULL DEFAULT 'payment',
  `created_by` VARCHAR(100) DEFAULT 'satish',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Saved Snapshot Records Table (Calendar History)
CREATE TABLE IF NOT EXISTS `saved_records` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `date` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `customerCount` INT NOT NULL DEFAULT 0,
  `totalAmount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `customersData` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

