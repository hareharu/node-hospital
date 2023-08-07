BEGIN TRANSACTION;
ALTER TABLE "schedulegroups" RENAME TO "_schedulegroups";
CREATE TABLE "schedulegroups" (
	"id"	TEXT NOT NULL UNIQUE,
	"pos"	INTEGER,
  "type"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("id")
);
INSERT INTO "schedulegroups" ("id", "pos", "type", "name")
	SELECT "id", "pos", "guz" as "type", "name"
	FROM "_schedulegroups";
DROP TABLE "_schedulegroups";
COMMIT;
