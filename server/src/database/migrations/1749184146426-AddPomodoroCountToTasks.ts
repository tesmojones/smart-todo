import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPomodoroCountToTasks1749184146426 implements MigrationInterface {
    name = 'AddPomodoroCountToTasks1749184146426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "pomodoro_count" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "pomodoro_count"`);
    }

}
