import { Migration } from '@mikro-orm/migrations';

export class Migration20260203110419 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_search_popularity" drop constraint if exists "product_search_popularity_product_id_unique";`);
    this.addSql(`create table if not exists "product_search_popularity" ("id" text not null, "product_id" text not null, "click_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_search_popularity_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_search_popularity_product_id_unique" ON "product_search_popularity" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_search_popularity_deleted_at" ON "product_search_popularity" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_search_popularity" cascade;`);
  }

}
