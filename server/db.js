const pg = require('pg');

class Song {
    constructor(title_id, type, song_name, song_duration, youtube_id) {
        this.title_id = title_id;
        this.type = type;
        this.song_name = song_name;
        this.song_duration = song_duration;
        this.youtube_id = youtube_id;
    };
}

class GuessDb {
    constructor(connectionString) {
        // this.pool = new pg.Pool(connectionString);
        this.pool = new pg.Pool();

        this.pool.on("error", console.error);
    }
    
    async add_title(type, title) {
        const query = {
            text: 'INSERT INTO titles(type, title) VALUES($1, $2) RETURNING *',
            values: [type, title],
        };

        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return result.rows;
    }

    // table songs
    // "id" integer PRIMARY KEY,
    // "title_id" integer,
    // "type" types,
    // "song_name" varchar(255),
    // "song_duration" integer,
    // "youtube_id" varchar(50),
    // "correct" integer,
    // "misses" integer

    /**
     * 
     * @param {Song} value 
     */
    async add_song(value) {
        const query = {
            text: 'INSERT INTO songs(title_id, type, song_name, song_duration, youtube_id, correct, misses) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: [value.title_id, value.type, value.song_name, value.song_duration, value.youtube_id, 0, 0],
        };

        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return result.rows;
    }

    /**
     * 
     * @param {{id, correct, misses}} rows 
     * @returns 
     */
    async update_songs_statistics(rows) {
        const client = await this.pool.connect();
        try {
            for (const {id, correct, misses} of rows) {
                const query = {
                    text: 'UPDATE songs SET correct = $1, misses = $2 WHERE id = $3',
                    values: [correct, misses, id],
                };
                
                await client.query(query);
            }
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }

    async get_titles_starts_with(name) {
        name += '%';
        const query = {
            text: `SELECT * FROM titles WHERE title ILIKE $1 ORDER BY title LIMIT 100`,
            values: [name]
        };

        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return result.rows;
    }

    async get_titles_starts_with_and_type(name, type) {
        name += '%';
        const query = {
            text: `SELECT * FROM titles WHERE title ILIKE $1 AND type = $2 ORDER BY title LIMIT 100`,
            values: [name, type]
        };

        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return result.rows;
    }

    async get_songs_starts_with(name) {
        name += '%';
        const query = {
            text: `SELECT * FROM songs WHERE song_name ILIKE $1 ORDER BY song_name LIMIT 100`,
            values: [name]
        };

        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return result.rows;
    }

    async get_songs_random(total) {
        const query = {
            text: `SELECT * FROM f_random_sample(null::"songs", "id", $1, 1.03) ORDER BY song_name`,
            values: [total]
        };

        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return result.rows;
    }
}

module.exports = { GuessDb, Song };