-- AlterTable
ALTER TABLE `contactmessage` ADD COLUMN `consentAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `ContactActivity` (
    `id` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NOT NULL,
    `type` ENUM('NOTE', 'STATUS_CHANGE') NOT NULL,
    `note` TEXT NULL,
    `fromStatus` ENUM('NEW', 'READ', 'REPLIED', 'ARCHIVED') NULL,
    `toStatus` ENUM('NEW', 'READ', 'REPLIED', 'ARCHIVED') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactActivity_contactId_createdAt_idx`(`contactId`, `createdAt`),
    INDEX `ContactActivity_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContactActivity` ADD CONSTRAINT `ContactActivity_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `ContactMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactActivity` ADD CONSTRAINT `ContactActivity_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
