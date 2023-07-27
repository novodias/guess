CREATE TYPE "types" AS ENUM (
  'Animes',
  'Movies',
  'Series',
  'Games',
  'Musics'
);

CREATE TABLE "songs" (
  "id" integer PRIMARY KEY,
  "title_id" integer,
  "type" types,
  "song_name" varchar(255),
  "song_duration" integer,
  "youtube_id" varchar(50),
  "correct" integer,
  "misses" integer
);

CREATE TABLE "titles" (
  "id" integer PRIMARY KEY,
  "type" types,
  "title" varchar(255)
);

ALTER TABLE "songs" ADD FOREIGN KEY ("title_id") REFERENCES "titles" ("id");

CREATE OR REPLACE FUNCTION f_random_sample(_tbl_type anyelement
                                         , _id text = 'id'
                                         , _limit int = 1000
                                         , _gaps real = 1.03)
  RETURNS SETOF anyelement
  LANGUAGE plpgsql VOLATILE ROWS 1000 AS
$func$
DECLARE
   -- safe syntax with schema & quotes where needed
   _tbl text := pg_typeof(_tbl_type)::text;
   _estimate int := (SELECT (reltuples / relpages
                          * (pg_relation_size(oid) / 8192))::bigint
                     FROM   pg_class  -- get current estimate from system
                     WHERE  oid = _tbl::regclass);
BEGIN
   RETURN QUERY EXECUTE format(
   $$
   WITH RECURSIVE random_pick AS (
      SELECT *
      FROM  (
         SELECT 1 + trunc(random() * $1)::int
         FROM   generate_series(1, $2) g
         LIMIT  $2                 -- hint for query planner
         ) r(%2$I)
      JOIN   %1$s USING (%2$I)     -- eliminate misses

      UNION                        -- eliminate dupes
      SELECT *
      FROM  (
         SELECT 1 + trunc(random() * $1)::int
         FROM   random_pick        -- just to make it recursive
         LIMIT  $3                 -- hint for query planner
         ) r(%2$I)
      JOIN   %1$s USING (%2$I)     -- eliminate misses
   )
   TABLE  random_pick
   LIMIT  $3;
   $$
 , _tbl, _id
   )
   USING _estimate              -- $1
       , (_limit * _gaps)::int  -- $2 ("surplus")
       , _limit                 -- $3
   ;
END
$func$;

-- ALTER TABLE "songs" ADD FOREIGN KEY ("type") REFERENCES "titles" ("type");
