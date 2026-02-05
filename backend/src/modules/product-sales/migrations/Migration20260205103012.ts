import { Migration } from '@mikro-orm/migrations';

export class Migration20260205103012 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop index if exists "IDX_product_sales_category_id";`);
    this.addSql(`drop index if exists "IDX_product_sales_collection_id";`);
    this.addSql(`alter table if exists "product_sales" drop column if exists "category_id", drop column if exists "collection_id";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_sales" add column if not exists "category_id" text null, add column if not exists "collection_id" text null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_category_id" ON "product_sales" (category_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_collection_id" ON "product_sales" (collection_id) WHERE deleted_at IS NULL;`);
  }

}
