CREATE TABLE `employee_status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`effective_date` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_employee_status_employee` ON `employee_status_history` (`employee_id`);--> statement-breakpoint
ALTER TABLE `work_orders` ADD `quantity` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `work_orders` ADD `model` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `work_orders` ADD `start_date` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `work_orders` ADD `notes` text DEFAULT '' NOT NULL;