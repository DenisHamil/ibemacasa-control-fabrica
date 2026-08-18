CREATE TABLE `purchase_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity_base` real NOT NULL,
	`entered_quantity` real NOT NULL,
	`entered_unit` text NOT NULL,
	`unit_price_bs` real NOT NULL,
	`subtotal_bs` real NOT NULL,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_purchase_items_purchase_id` ON `purchase_items` (`purchase_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_items_product_id` ON `purchase_items` (`product_id`);--> statement-breakpoint
ALTER TABLE `movements` ADD `loan_movement_id` integer;--> statement-breakpoint
CREATE INDEX `idx_movements_loan_id` ON `movements` (`loan_movement_id`);--> statement-breakpoint
ALTER TABLE `products` ADD `section` text DEFAULT 'Sin sección' NOT NULL;