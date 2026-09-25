-- AlterTable
ALTER TABLE `users` ADD COLUMN `identity_number` VARCHAR(20) NULL,
    ADD COLUMN `user_type` ENUM('MAHASISWA', 'DOSEN', 'TENDIK') NOT NULL DEFAULT 'MAHASISWA';

-- CreateIndex
CREATE UNIQUE INDEX `users_identity_number_key` ON `users`(`identity_number`);

-- CreateIndex
CREATE INDEX `users_user_type_idx` ON `users`(`user_type`);
