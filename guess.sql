CREATE TABLE "data" (
  "id" integer PRIMARY KEY,
  "title" varchar,
  "type" varchar,
  "name" varchar,
  "video_id" varchar,
  "time" integer,
  "created_at" timestamp
);

CREATE TABLE "statistics" (
  "id" integer PRIMARY KEY,
  "title" varchar,
  "type" varchar,
  "name" varchar,
  "correct" integer,
  "fail" integer
);
