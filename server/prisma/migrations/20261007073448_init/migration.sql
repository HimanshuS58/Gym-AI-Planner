/*
  Warnings:

  - You are about to drop the column `days_per_weel` on the `user_profiles` table. All the data in the column will be lost.
  - Added the required column `days_per_week` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "days_per_weel",
ADD COLUMN     "days_per_week" INTEGER NOT NULL;
