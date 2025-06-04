import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTaskFields1748736370788 implements MigrationInterface {
    name = 'RemoveTaskFields1748736370788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completed"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completed_at"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "next_occurrence"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "next_occurrence" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "completed" boolean NOT NULL DEFAULT false`);
    }

}
