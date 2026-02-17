import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductIdToOrderItem1771327743374 implements MigrationInterface {
    name = 'AddProductIdToOrderItem1771327743374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "site"."idx_product_id"`);
        await queryRunner.query(`DROP INDEX "site"."idx_order_item_order_id"`);
        await queryRunner.query(`DROP INDEX "site"."idx_order_created_at"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "site"."s_product" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "site"."s_product" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" DROP CONSTRAINT "FK_92ebda743c20ab7a29f8da1b64e"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" DROP CONSTRAINT "FK_24597a80c8003213934a0a5ff52"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "order_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" DROP CONSTRAINT "FK_7bbb701bf96fdc6a3427412d15c"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ADD CONSTRAINT "UQ_6aa0e0fc614ed79eaa6e264a8b3" UNIQUE ("idempotencyKey")`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "idempotencyKey" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "site"."order_status" AS ENUM('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ADD "status" "site"."order_status" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP CONSTRAINT "s_user_email_key"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD CONSTRAINT "UQ_9bcea801f0d5bf388e998f08392" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ADD CONSTRAINT "UQ_6aa0e0fc614ed79eaa6e264a8b3" UNIQUE ("idempotencyKey")`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "idempotencyKey" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "order_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ADD CONSTRAINT "FK_92ebda743c20ab7a29f8da1b64e" FOREIGN KEY ("order_id") REFERENCES "site"."s_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ADD CONSTRAINT "FK_24597a80c8003213934a0a5ff52" FOREIGN KEY ("product_id") REFERENCES "site"."s_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ADD CONSTRAINT "FK_7bbb701bf96fdc6a3427412d15c" FOREIGN KEY ("user_id") REFERENCES "site"."s_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site"."s_order" DROP CONSTRAINT "FK_7bbb701bf96fdc6a3427412d15c"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" DROP CONSTRAINT "FK_24597a80c8003213934a0a5ff52"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" DROP CONSTRAINT "FK_92ebda743c20ab7a29f8da1b64e"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "order_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "idempotencyKey" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" DROP CONSTRAINT "UQ_6aa0e0fc614ed79eaa6e264a8b3"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP CONSTRAINT "UQ_9bcea801f0d5bf388e998f08392"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD CONSTRAINT "s_user_email_key" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "site"."order_status"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ADD "status" order_status NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ALTER COLUMN "idempotencyKey" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" DROP CONSTRAINT "UQ_6aa0e0fc614ed79eaa6e264a8b3"`);
        await queryRunner.query(`ALTER TABLE "site"."s_order" ADD CONSTRAINT "FK_7bbb701bf96fdc6a3427412d15c" FOREIGN KEY ("user_id") REFERENCES "site"."s_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ALTER COLUMN "order_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ADD CONSTRAINT "FK_24597a80c8003213934a0a5ff52" FOREIGN KEY ("product_id") REFERENCES "site"."s_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site"."s_order_item" ADD CONSTRAINT "FK_92ebda743c20ab7a29f8da1b64e" FOREIGN KEY ("order_id") REFERENCES "site"."s_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site"."s_product" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "site"."s_product" ADD "stock" numeric DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "site"."s_user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "idx_order_created_at" ON "site"."s_order" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_order_item_order_id" ON "site"."s_order_item" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "idx_product_id" ON "site"."s_product" ("id") `);
    }

}
