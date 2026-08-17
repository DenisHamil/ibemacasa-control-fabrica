CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`ci` text NOT NULL,
	`area` text NOT NULL,
	`role` text DEFAULT 'trabajador' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`hire_date` text NOT NULL,
	`status` text DEFAULT 'activo' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_ci_unique` ON `employees` (`ci`);--> statement-breakpoint
CREATE TABLE `movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`employee_id` integer,
	`kind` text NOT NULL,
	`quantity_base` real NOT NULL,
	`entered_quantity` real NOT NULL,
	`entered_unit` text NOT NULL,
	`condition` text DEFAULT 'bueno' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`tracking_type` text NOT NULL,
	`base_unit` text NOT NULL,
	`stock_base` real DEFAULT 0 NOT NULL,
	`min_stock_base` real DEFAULT 0 NOT NULL,
	`purchase_presentation` text NOT NULL,
	`presentation_factor_base` real DEFAULT 1 NOT NULL,
	`location` text DEFAULT 'Sin asignar' NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`supplier` text NOT NULL,
	`invoice` text NOT NULL,
	`total_bs` real NOT NULL,
	`status` text DEFAULT 'pendiente_recepcion' NOT NULL,
	`purchase_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
