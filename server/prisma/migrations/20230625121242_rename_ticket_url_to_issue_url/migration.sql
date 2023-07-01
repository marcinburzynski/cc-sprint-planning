/*
  Warnings:

  - You are about to drop the column `ticketUrl` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ticketUrl",
ADD COLUMN     "issueUrl" TEXT;
