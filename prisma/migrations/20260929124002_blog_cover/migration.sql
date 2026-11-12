-- AlterTable
ALTER TABLE `blogpost` ADD COLUMN `coverMediaId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `BlogPost_coverMediaId_idx` ON `BlogPost`(`coverMediaId`);

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
