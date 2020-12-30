BEGIN TRANSACTION;
DROP TABLE IF EXISTS "kanbancards";
CREATE TABLE IF NOT EXISTS "kanbancards" (
	"id"	TEXT NOT NULL UNIQUE,
	"columnid"	TEXT,
	"pos"	INTEGER,
	"typeid"	TEXT,
	"title"	TEXT,
	"description"	TEXT,
	"added"	TEXT,
	"addedby"	TEXT,
	"edited"	TEXT,
	"editedby"	TEXT,
	"deleted"	TEXT,
	"user"	TEXT,
	"deadline"	TEXT,
	"comment"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "kanbancolumns";
CREATE TABLE IF NOT EXISTS "kanbancolumns" (
	"id"	TEXT NOT NULL UNIQUE,
	"boardid"	TEXT,
	"pos"	INTEGER,
	"title"	TEXT,
	"deleted"	TEXT,
	"type"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "settings";
CREATE TABLE IF NOT EXISTS "settings" (
	"name"	TEXT,
	"type"	TEXT,
	"value"	TEXT,
	"description"	TEXT,
	"defaultvalue"	TEXT,
	PRIMARY KEY("name")
);
DROP TABLE IF EXISTS "kanbanboards";
CREATE TABLE IF NOT EXISTS "kanbanboards" (
	"id"	TEXT NOT NULL UNIQUE,
	"pos"	INTEGER,
	"name"	TEXT,
	"deleted"	TEXT,
	"userid"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "news";
CREATE TABLE IF NOT EXISTS "news" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"text"	TEXT,
	"day"	TEXT,
	"added"	TEXT,
	"addedby"	TEXT,
	"edited"	TEXT,
	"editedby"	TEXT,
	"deleted"	TEXT,
	"categoryid"	TEXT,
	"hide"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "newscategory";
CREATE TABLE IF NOT EXISTS "newscategory" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"added"	TEXT,
	"addedby"	TEXT,
	"edited"	TEXT,
	"editedby"	TEXT,
	"deleted"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "panels";
CREATE TABLE IF NOT EXISTS "panels" (
	"id"	TEXT NOT NULL UNIQUE,
	"pos"	INTEGER,
	"key"	TEXT,
	"name"	TEXT,
	"icon"	TEXT,
	"size"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "videoplayer";
CREATE TABLE IF NOT EXISTS "videoplayer" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"type"	TEXT,
	"path"	TEXT,
	"duration"	TEXT,
	"description"	TEXT,
	"poster"	TEXT,
	"category"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "roles";
CREATE TABLE IF NOT EXISTS "roles" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"access"	TEXT,
	"departmentid"	TEXT,
	"sidemenuid"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "users";
CREATE TABLE IF NOT EXISTS "users" (
	"id"	TEXT NOT NULL UNIQUE,
	"roleid"	TEXT,
	"deleted"	TEXT,
	"name"	TEXT,
	"employeeid"	TEXT,
	"authtype"	TEXT,
	"login"	TEXT,
	"pass"	TEXT,
	"description"	TEXT,
	"doctor"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "kanbantypes";
CREATE TABLE IF NOT EXISTS "kanbantypes" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"icon"	TEXT,
	"color"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "queries";
CREATE TABLE IF NOT EXISTS "queries" (
	"id"	TEXT NOT NULL UNIQUE,
	"db"	TEXT,
	"groupid"	TEXT,
	"name"	TEXT,
	"query"	TEXT,
	"description"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "referencetags";
CREATE TABLE IF NOT EXISTS "referencetags" (
	"id"	TEXT NOT NULL UNIQUE,
	"elementid"	TEXT,
	"tag"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "hardwareselect";
CREATE TABLE IF NOT EXISTS "hardwareselect" (
	"id"	TEXT NOT NULL UNIQUE,
	"class"	TEXT,
	"field"	TEXT,
	"key"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "hardwaretags";
CREATE TABLE IF NOT EXISTS "hardwaretags" (
	"id"	TEXT NOT NULL UNIQUE,
	"class"	TEXT,
	"field"	TEXT,
	"name"	TEXT,
	"type"	TEXT,
	"pos"	INTEGER,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "hardwarenotes";
CREATE TABLE IF NOT EXISTS "hardwarenotes" (
	"id"	TEXT NOT NULL UNIQUE,
	"elementid"	TEXT,
	"timestamp"	TEXT,
	"userid"	TEXT,
	"comment"	TEXT,
	"action"	TEXT,
	"ondate"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "hardwareinfo";
CREATE TABLE IF NOT EXISTS "hardwareinfo" (
	"id"	TEXT NOT NULL UNIQUE,
	"deviceid"	TEXT,
	"ondate"	TEXT,
	"timestamp"	TEXT,
	"userid"	TEXT,
	"action"	TEXT,
	"field"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "hardwaregroups";
CREATE TABLE IF NOT EXISTS "hardwaregroups" (
	"id"	TEXT NOT NULL UNIQUE,
	"groupid"	TEXT,
	"ondate"	TEXT,
	"timestamp"	TEXT,
	"userid"	TEXT,
	"action"	TEXT,
	"name"	TEXT,
	"employeeid"	TEXT,
	"locationid"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "hardwareaccounting";
CREATE TABLE IF NOT EXISTS "hardwareaccounting" (
	"id"	TEXT NOT NULL UNIQUE,
	"deviceid"	TEXT,
	"ondate"	TEXT,
	"timestamp"	TEXT,
	"userid"	TEXT,
	"action"	TEXT,
	"status"	TEXT,
	"inventory"	TEXT,
	"ownerid"	TEXT,
	"locationid"	TEXT,
	"groupid"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "referencecatalogs";
CREATE TABLE IF NOT EXISTS "referencecatalogs" (
	"id"	TEXT NOT NULL UNIQUE,
	"elementid"	TEXT,
	"parentid"	TEXT,
	"catalog"	TEXT,
	"action"	TEXT,
	"name"	TEXT,
	"description"	TEXT,
	"userid"	TEXT,
	"timestamp"	TEXT,
	"ondate"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "schedulegroups";
CREATE TABLE IF NOT EXISTS "schedulegroups" (
	"id"	TEXT NOT NULL UNIQUE,
	"pos"	INTEGER,
	"name"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "schedule";
CREATE TABLE IF NOT EXISTS "schedule" (
	"id"	TEXT NOT NULL UNIQUE,
	"pos"	INTEGER,
	"groupid"	TEXT,
	"code"	TEXT,
	"uch"	INTEGER,
	"room"	TEXT,
	"spec"	TEXT,
	"name"	TEXT,
	"day0"	TEXT,
	"day1"	TEXT,
	"day2"	TEXT,
	"day3"	TEXT,
	"day4"	TEXT,
	"day5"	TEXT,
	"day6"	TEXT,
	"day7"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "queriesgroups";
CREATE TABLE IF NOT EXISTS "queriesgroups" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "passwordsgroups";
CREATE TABLE IF NOT EXISTS "passwordsgroups" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "passwords";
CREATE TABLE IF NOT EXISTS "passwords" (
	"id"	TEXT NOT NULL UNIQUE,
	"groupid"	TEXT,
	"employeeid"	TEXT,
	"login"	TEXT,
	"pass"	TEXT,
	"memory"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "sidemenu";
CREATE TABLE IF NOT EXISTS "sidemenu" (
	"id"	TEXT NOT NULL UNIQUE,
	"roleid"	TEXT,
	"pos"	INTEGER,
	"folder"	TEXT,
	"type"	TEXT,
	"key"	TEXT,
	"icon"	TEXT,
	"name"	TEXT,
	"title"	TEXT,
	"url"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "phonebook";
CREATE TABLE IF NOT EXISTS "phonebook" (
	"id"	TEXT NOT NULL UNIQUE,
	"dept"	TEXT,
	"job"	TEXT,
	"name"	TEXT,
	"phone"	TEXT,
	"email"	TEXT,
	"room"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "homepage";
CREATE TABLE IF NOT EXISTS "homepage" (
	"id"	TEXT NOT NULL UNIQUE,
	"side"	TEXT,
	"pos"	INTEGER,
	"type"	TEXT,
	"text"	TEXT,
	"url"	TEXT,
	"icon"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "templates";
CREATE TABLE IF NOT EXISTS "templates" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"full"	TEXT,
	"text"	TEXT,
	"added"	TEXT,
	"addedby"	TEXT,
	"edited"	TEXT,
	"editedby"	TEXT,
	"deleted"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "mkb10";
CREATE TABLE IF NOT EXISTS "mkb10" (
	"rowgroup0"	TEXT,
	"rowgroup1"	TEXT,
	"rowgroup2"	TEXT,
	"mkb"	TEXT,
	"code"	TEXT,
	"mkbname"	TEXT,
	"mkbnamelow"	TEXT,
	"notes"	TEXT,
	"rowcolor"	TEXT
);
DROP TABLE IF EXISTS "records";
CREATE TABLE IF NOT EXISTS "records" (
	"id"	TEXT NOT NULL UNIQUE,
	"name"	TEXT,
	"text"	TEXT,
	"pdf"	BLOB,
	"day"	TEXT,
	"patient"	TEXT,
	"template"	TEXT,
	"added"	TEXT,
	"addedby"	TEXT,
	"edited"	TEXT,
	"editedby"	TEXT,
	"deleted"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "sessions";
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid"	TEXT,
	"expired"	TEXT,
	"sess"	TEXT,
	PRIMARY KEY("sid")
);
DROP INDEX IF EXISTS "mkb10_name";
CREATE INDEX IF NOT EXISTS "mkb10_name" ON "mkb10" (
	"mkbnamelow"
);
DROP INDEX IF EXISTS "mkb10_mkb";
CREATE INDEX IF NOT EXISTS "mkb10_mkb" ON "mkb10" (
	"mkb"
);
COMMIT;
