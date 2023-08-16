CREATE TYPE "types" AS ENUM (
  'Animes',
  'Movies',
  'Series',
  'Games',
  'Musics'
);

CREATE TABLE "songs" (
  "id" integer SERIAL PRIMARY KEY NOT NULL,
  "title_id" integer NOT NULL,
  "type" types,
  "name" varchar(255) NOT NULL,
  "duration" integer NOT NULL,
  "youtube_id" varchar(50) NOT NULL,
  "correct" integer,
  "misses" integer
);

CREATE TABLE "titles" (
  "id" integer SERIAL PRIMARY KEY NOT NULL,
  "type" types,
  "name" varchar(255) NOT NULL,
  "tags" varchar[] NOT NULL
);

ALTER TABLE "songs" ADD FOREIGN KEY ("title_id") REFERENCES "titles" ("id");

-- ALTER TABLE "songs" ADD FOREIGN KEY ("type") REFERENCES "titles" ("type");
