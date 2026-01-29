import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "first_name" character varying,
        "last_name" character varying,
        "role" character varying NOT NULL DEFAULT 'staff',
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        "date_of_birth" DATE,
        "is_vip" boolean NOT NULL DEFAULT false,
        "tags" text[],
        "notes" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_clients_email" UNIQUE ("email")
      )
    `);

    // Create staff table
    await queryRunner.query(`
      CREATE TABLE "staff" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "role" character varying NOT NULL,
        "specialties" text[],
        "hourly_rate" decimal(10,2),
        "commission_rate" decimal(5,4),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_staff_email" UNIQUE ("email")
      )
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "category" character varying,
        "duration" integer NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_services_id" PRIMARY KEY ("id")
      )
    `);

    // Create staff_services table
    await queryRunner.query(`
      CREATE TABLE "staff_services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "staff_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_services_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_services_staff_id" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_services_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_staff_services_staff_service" UNIQUE ("staff_id", "service_id")
      )
    `);

    // Create appointments table
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "client_id" uuid NOT NULL,
        "staff_id" uuid NOT NULL,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'scheduled',
        "notes" text,
        "actual_start_time" TIMESTAMP,
        "actual_end_time" TIMESTAMP,
        "rating" integer,
        "feedback" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appointments_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointments_staff_id" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE
      )
    `);

    // Create appointment_services table
    await queryRunner.query(`
      CREATE TABLE "appointment_services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appointment_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointment_services_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appointment_services_appointment_id" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointment_services_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE
      )
    `);

    // Create sales table
    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "client_id" uuid,
        "transaction_id" character varying NOT NULL,
        "total" decimal(10,2) NOT NULL,
        "tax_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "discount_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'completed',
        "completed_at" TIMESTAMP NOT NULL,
        "refund_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "refund_reason" text,
        "refunded_at" TIMESTAMP,
        "completed_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sales_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sales_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sales_completed_by" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "UQ_sales_transaction_id" UNIQUE ("transaction_id")
      )
    `);

    // Create sale_items table
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sale_id" uuid NOT NULL,
        "service_id" uuid,
        "product_id" uuid,
        "staff_id" uuid,
        "quantity" integer NOT NULL DEFAULT 1,
        "price" decimal(10,2) NOT NULL,
        "discount_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sale_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sale_items_sale_id" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sale_items_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sale_items_staff_id" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL
      )
    `);

    // Create payment_methods table
    await queryRunner.query(`
      CREATE TABLE "payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sale_id" uuid NOT NULL,
        "type" character varying NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "reference" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_methods_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_methods_sale_id" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE
      )
    `);

    // Create manufacturers table
    await queryRunner.query(`
      CREATE TABLE "manufacturers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "contact_email" character varying,
        "contact_phone" character varying,
        "address" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_manufacturers_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_manufacturers_name" UNIQUE ("name")
      )
    `);

    // Create product_types table
    await queryRunner.query(`
      CREATE TABLE "product_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_types_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_types_name" UNIQUE ("name")
      )
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "sku" character varying NOT NULL,
        "barcode" character varying,
        "manufacturer_id" uuid,
        "type_id" uuid,
        "cost_price" decimal(10,2) NOT NULL,
        "selling_price" decimal(10,2) NOT NULL,
        "quantity_in_stock" integer NOT NULL DEFAULT 0,
        "low_stock_threshold" integer NOT NULL DEFAULT 5,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_manufacturer_id" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_products_type_id" FOREIGN KEY ("type_id") REFERENCES "product_types"("id") ON DELETE SET NULL,
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode")
      )
    `);

    // Create inventory_transactions table
    await queryRunner.query(`
      CREATE TABLE "inventory_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "type" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "quantity_before" integer NOT NULL,
        "quantity_after" integer NOT NULL,
        "notes" text,
        "reference_id" character varying,
        "performed_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_transactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_transactions_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventory_transactions_performed_by" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create client_notes table
    await queryRunner.query(`
      CREATE TABLE "client_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "client_id" uuid NOT NULL,
        "note" text NOT NULL,
        "created_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_client_notes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_client_notes_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_client_notes_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create business_settings table
    await queryRunner.query(`
      CREATE TABLE "business_settings" (
        "id" integer NOT NULL,
        "business_name" character varying NOT NULL,
        "business_email" character varying NOT NULL,
        "business_phone" character varying,
        "business_address" text,
        "timezone" character varying NOT NULL DEFAULT 'UTC',
        "currency" character varying NOT NULL DEFAULT 'USD',
        "date_format" character varying NOT NULL DEFAULT 'MM/DD/YYYY',
        "time_format" character varying NOT NULL DEFAULT '24h',
        "settings" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_business_settings_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_email" ON "clients" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_phone" ON "clients" ("phone")`);
    await queryRunner.query(`CREATE INDEX "IDX_staff_email" ON "staff" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_client_id" ON "appointments" ("client_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_staff_id" ON "appointments" ("staff_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_start_time" ON "appointments" ("start_time")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_status" ON "appointments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_sales_client_id" ON "sales" ("client_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_sales_completed_at" ON "sales" ("completed_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_sales_status" ON "sales" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_sku" ON "products" ("sku")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_barcode" ON "products" ("barcode")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_manufacturer_id" ON "products" ("manufacturer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_type_id" ON "products" ("type_id")`);

    // Create composite indexes for common queries
    await queryRunner.query(`CREATE INDEX "IDX_appointments_staff_time" ON "appointments" ("staff_id", "start_time", "end_time")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_client_time" ON "appointments" ("client_id", "start_time")`);
    await queryRunner.query(`CREATE INDEX "IDX_sales_date_status" ON "sales" ("completed_at", "status")`);

    // Create database views for reporting
    await queryRunner.query(`
      CREATE VIEW "active_appointments" AS
      SELECT 
        a.id,
        a.client_id,
        a.staff_id,
        a.start_time,
        a.end_time,
        a.status,
        c.first_name || ' ' || c.last_name as client_name,
        s.first_name || ' ' || s.last_name as staff_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN staff s ON a.staff_id = s.id
      WHERE a.status IN ('scheduled', 'checked-in')
    `);

    await queryRunner.query(`
      CREATE VIEW "client_lifetime_value" AS
      SELECT 
        c.id as client_id,
        c.first_name || ' ' || c.last_name as client_name,
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT s.id) as total_sales,
        COALESCE(SUM(s.total), 0) as lifetime_value,
        COALESCE(AVG(s.total), 0) as average_ticket
      FROM clients c
      LEFT JOIN appointments a ON c.id = a.client_id AND a.status = 'completed'
      LEFT JOIN sales s ON c.id = s.client_id AND s.status = 'completed'
      GROUP BY c.id, c.first_name, c.last_name
    `);

    await queryRunner.query(`
      CREATE VIEW "daily_sales_summary" AS
      SELECT 
        DATE(s.completed_at) as sale_date,
        COUNT(*) as total_transactions,
        SUM(s.total) as total_revenue,
        AVG(s.total) as average_ticket,
        COUNT(DISTINCT s.client_id) as unique_clients
      FROM sales s
      WHERE s.status = 'completed'
      GROUP BY DATE(s.completed_at)
      ORDER BY sale_date DESC
    `);

    await queryRunner.query(`
      CREATE VIEW "low_stock_products" AS
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.quantity_in_stock,
        p.low_stock_threshold,
        m.name as manufacturer_name,
        pt.name as product_type_name
      FROM products p
      LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
      LEFT JOIN product_types pt ON p.type_id = pt.id
      WHERE p.quantity_in_stock <= p.low_stock_threshold
      AND p.is_active = true
    `);

    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop views
    await queryRunner.query(`DROP VIEW IF EXISTS "low_stock_products"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "daily_sales_summary"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "client_lifetime_value"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "active_appointments"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "business_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "client_notes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "manufacturers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_methods"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sales"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "appointment_services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "appointments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}


