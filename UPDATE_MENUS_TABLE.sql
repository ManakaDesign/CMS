-- SQL script to add is_global column to existing menus table
-- Run this if you already have the CMS installed and need to update the menus table

ALTER TABLE `menus` ADD COLUMN `is_global` BOOLEAN NOT NULL DEFAULT 0 AFTER `is_active`;
