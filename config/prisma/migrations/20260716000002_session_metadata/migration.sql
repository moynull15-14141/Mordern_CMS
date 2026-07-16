-- Milestone 4.1 §3 — Session Foundation Improvement.
-- Adds architecture-readiness metadata columns to "sessions". No logic
-- populates browser/operating_system/country/city yet (no user-agent
-- parser or geo-IP lookup wired in this patch); they exist so a future
-- change can populate them without another schema migration. remember_me
-- records whether the session was created via "remember me" at login.
-- device_name, ip_address, and lastSeenAt (last activity) already existed
-- from the initial schema — not duplicated here.

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "browser" TEXT;
ALTER TABLE "sessions" ADD COLUMN "operating_system" TEXT;
ALTER TABLE "sessions" ADD COLUMN "country" TEXT;
ALTER TABLE "sessions" ADD COLUMN "city" TEXT;
ALTER TABLE "sessions" ADD COLUMN "remember_me" BOOLEAN NOT NULL DEFAULT false;
