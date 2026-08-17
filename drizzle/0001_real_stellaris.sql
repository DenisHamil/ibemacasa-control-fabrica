CREATE INDEX `idx_attendance_employee_id` ON `attendance` (`employee_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_product_id` ON `movements` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_employee_id` ON `movements` (`employee_id`);--> statement-breakpoint
CREATE INDEX `idx_purchases_date` ON `purchases` (`purchase_date`);