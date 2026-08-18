CREATE TABLE `work_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`client` text DEFAULT '' NOT NULL,
	`responsible_employee_id` integer NOT NULL,
	`area` text NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'en_proceso' NOT NULL,
	`due_date` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`responsible_employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_orders_code_unique` ON `work_orders` (`code`);--> statement-breakpoint
CREATE INDEX `idx_work_orders_responsible` ON `work_orders` (`responsible_employee_id`);--> statement-breakpoint
CREATE INDEX `idx_work_orders_status` ON `work_orders` (`status`);