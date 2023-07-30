const pg = require('pg');
const moment = require('moment');

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
        this.beat = { lastbeat: null, count: 0 };

        this.pool.on("error", console.error);
        this.pool.on('connect', () => {
            this.beat.count++;
            
            const now = new Date;
            
            if (this.beat.lastbeat === null) {
                this.beat.lastbeat = now.getMinutes();
                return;
            }

            if (this.beat.lastbeat !== now.getMinutes()) {
                console.log(`[Db/Heartbeat] ${(this.beat.count / 60).toFixed(2)} connections per minute`);
                this.beat.count = 0;
                this.beat.lastbeat = now.getMinutes();
            }
        });
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

    async get_title_by_id(id) {
        const query = {
            text: `SELECT * FROM titles WHERE id = $1`,
            values: [id]
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
     * @param {String} name 
     * @returns {Array | null}
     */
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

    async get_song_by_youtube_id(id) {
        const query = {
            text: `SELECT * FROM songs WHERE youtube_id = $1`,
            values: [id]
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

    async get_songs_starts_with({name, type, title_id}) {
        // name += '%';
        // const queryType = !type ?
        //     '' :
        //     `AND type = $2`;
        // const queryTitle = !title_id ?
        //     '' :
        //     `AND id = $3`;
        
        const values = [];
        let batch = 1;
        let queryName = '', queryType = '', queryTitle = '';
        if (name) {
            name += '%';
            queryName = `song_name ILIKE $${batch++}`;
            values.push(name);
        }

        if (type) {
            queryType = !type ? '' : `${batch > 1 ? "AND" : ""} type = $${batch++}`;
            values.push(type);
        }

        if (title_id) {
            queryTitle = !title_id ? '' : `${batch > 1 ? "AND" : ""} title_id = $${batch++}`;
            values.push(title_id);
        }

        const query = {
            text: `SELECT * FROM songs WHERE ${queryName} ${queryType} ${queryTitle} ORDER BY song_name LIMIT 100`,
            values
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

    async get_songs_random(total, type) {

        const query = {
            // text: `SELECT * FROM f_random_sample(null::"songs", 'oDD ID', $1, 1.03)`,
            text: `SELECT * FROM songs ${type && 'WHERE type = $2'} ORDER BY random() LIMIT $1`,
            values: [total]
        };

        type && query.values.push(type);

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