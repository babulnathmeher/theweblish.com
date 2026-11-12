CREATE TABLE `PortfolioProject` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `clientName` VARCHAR(191) NOT NULL,
    `industry` VARCHAR(100) NULL,
    `services` VARCHAR(255) NULL,
    `projectUrl` VARCHAR(2048) NULL,
    `summary` TEXT NOT NULL,
    `challenge` LONGTEXT NOT NULL,
    `approach` LONGTEXT NOT NULL,
    `outcome` LONGTEXT NULL,
    `coverMediaId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `indexable` BOOLEAN NOT NULL DEFAULT false,
    `seoTitle` VARCHAR(255) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `publishedAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PortfolioProject_slug_key`(`slug`),
    INDEX `PortfolioProject_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `PortfolioProject_coverMediaId_idx`(`coverMediaId`),
    INDEX `PortfolioProject_approvedById_idx`(`approvedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PortfolioProject` ADD CONSTRAINT `PortfolioProject_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `PortfolioProject` ADD CONSTRAINT `PortfolioProject_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
