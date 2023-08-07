BEGIN TRANSACTION;
ALTER TABLE "schedulegroups" RENAME TO "_schedulegroups";
CREATE TABLE "schedulegroups" (
	"id"	TEXT NOT NULL UNIQUE,
	"pos"	INTEGER,
  "type"	TEXT,
	"name"	TEXT,
  "title"	TEXT,
  "days" INTEGER,
  "room" INTEGER,
  "uch" INTEGER,
  "spec" INTEGER,
	PRIMARY KEY("id")
);
INSERT INTO "schedulegroups" ("id", "pos", "type", "name", "title", "days", "room", "uch", "spec")
	SELECT "id", "pos", "guz", "name", "врач", 5, "true", "true", "true"
	FROM "_schedulegroups";
DROP TABLE "_schedulegroups";
COMMIT;
