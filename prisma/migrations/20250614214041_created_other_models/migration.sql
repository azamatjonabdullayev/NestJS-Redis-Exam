/*
  Warnings:

  - The values [public,private,subs_only] on the enum `video_visibility` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `videos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `author_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `video_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "video-status" AS ENUM ('UPLOADING', 'UPLOADED', 'CANCELLED', 'FAILED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "channel_status" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "comment_status" AS ENUM ('APPROVED', 'BLOCKED');

-- AlterEnum
BEGIN;
CREATE TYPE "video_visibility_new" AS ENUM ('PUBLIC', 'PRIVATE', 'SUBS_ONLY');
ALTER TABLE "videos" ALTER COLUMN "visbility" DROP DEFAULT;
ALTER TABLE "videos" ALTER COLUMN "visbility" TYPE "video_visibility_new" USING ("visbility"::text::"video_visibility_new");
ALTER TYPE "video_visibility" RENAME TO "video_visibility_old";
ALTER TYPE "video_visibility_new" RENAME TO "video_visibility";
DROP TYPE "video_visibility_old";
ALTER TABLE "videos" ALTER COLUMN "visbility" SET DEFAULT 'PUBLIC';
COMMIT;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "author_id" UUID NOT NULL,
ADD COLUMN     "comment_status" "comment_status" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "video_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_status" "user_status" NOT NULL DEFAULT 'INACTIVE';

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "author_id" UUID NOT NULL,
ALTER COLUMN "thumbnail_url" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "video-status" NOT NULL DEFAULT 'UPLOADING',
ALTER COLUMN "visbility" SET DEFAULT 'PUBLIC';

-- DropEnum
DROP TYPE "status";

-- CreateTable
CREATE TABLE "channels" (
    "id" UUID NOT NULL,
    "channel_name" VARCHAR(100) NOT NULL,
    "channel_username" VARCHAR(100) NOT NULL,
    "channel_image_url" VARCHAR(255),
    "channel_description" VARCHAR(255),
    "author_id" UUID NOT NULL,
    "channel_status" "channel_status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel_id" UUID NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "channels_channel_username_key" ON "channels"("channel_username");

-- CreateIndex
CREATE UNIQUE INDEX "channels_author_id_key" ON "channels"("author_id");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
