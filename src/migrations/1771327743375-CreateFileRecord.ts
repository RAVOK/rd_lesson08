import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileRecord1771327743375 implements MigrationInterface {
  name = 'CreateFileRecord1771327743375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create file_status enum
    await queryRunner.query(`
      CREATE TYPE "site"."file_status" AS ENUM ('PENDING', 'READY')
    `);

    // Create file_visibility enum
    await queryRunner.query(`
      CREATE TYPE "site"."file_visibility" AS ENUM ('PRIVATE', 'PUBLIC')
    `);

    // Create s_file_record table
    await queryRunner.query(`
      CREATE TABLE "site"."s_file_record" (
        "id" SERIAL NOT NULL,
        "owner_id" integer NOT NULL,
        "entity_id" integer,
        "key" varchar(500) NOT NULL,
        "content_type" varchar(255) NOT NULL,
        "size" bigint NOT NULL,
        "status" "site"."file_status" NOT NULL DEFAULT 'PENDING',
        "visibility" "site"."file_visibility" NOT NULL DEFAULT 'PRIVATE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_file_record" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_file_record_owner_entity" ON "site"."s_file_record" ("owner_id", "entity_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_record_key" ON "site"."s_file_record" ("key")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "site"."IDX_file_record_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "site"."IDX_file_record_owner_entity"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "site"."s_file_record"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "site"."file_visibility"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "site"."file_status"`);
  }
}