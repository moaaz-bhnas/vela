import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260413132822 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "branding_carousel_slide" ("id" text not null, "image_url" text null, "title" text null, "description" text null, "link_url" text null, "link_text" text null, "sort_order" integer null, "branding_config_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "branding_carousel_slide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_branding_carousel_slide_branding_config_id" ON "branding_carousel_slide" ("branding_config_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_branding_carousel_slide_deleted_at" ON "branding_carousel_slide" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "branding_carousel_slide" add constraint "branding_carousel_slide_branding_config_id_foreign" foreign key ("branding_config_id") references "branding_config" ("id") on update cascade;`);

    this.addSql(`alter table if exists "branding_config" drop column if exists "carousel_slides", drop column if exists "seo_defaults";`);

    this.addSql(`alter table if exists "branding_config" add column if not exists "seo_site_tagline" text null, add column if not exists "seo_meta_description_template" text null, add column if not exists "seo_default_og_image_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "branding_carousel_slide" cascade;`);

    this.addSql(`alter table if exists "branding_config" drop column if exists "seo_site_tagline", drop column if exists "seo_meta_description_template", drop column if exists "seo_default_og_image_url";`);

    this.addSql(`alter table if exists "branding_config" add column if not exists "carousel_slides" jsonb null, add column if not exists "seo_defaults" jsonb null;`);
  }

}
