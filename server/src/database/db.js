const pg = require('pg');
const Song = require('../models/song');
const Title = require('../models/title');

class GuessRepository {
    /**
     * @type {GuessRepository}
     * @private
     */
    static _instance;

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GuessRepository();
        return this._instance;
    }

    /**
     * @private
     */
    constructor() {
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
                console.log(`[Db/Heartbeat] ${this.beat.count} connections per minute`);
                this.beat.count = 0;
                this.beat.lastbeat = now.getMinutes();
            }
        });
    }
    
    async add_title(type, name, tags) {
        const query = {
            text: 'INSERT INTO titles(type, name, tags) VALUES($1, $2, $3) RETURNING *',
            values: [type, name, tags],
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
        
        return Title.toArray(result.rows);
    }

    /**
     * @param {Song} value 
     * @returns {Song}
     */
    async add_song(value) {
        const query = {
            text: 'INSERT INTO songs(title_id, type, song_name, song_duration, youtube_id, correct, misses) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: [value.title_id, value.type, value.name, value.song_duration, value.youtube_id, 0, 0],
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

        return Song.instantiate(result.rows[0]);
    }

    /**
     * 
     * @param {{id, correct, misses}} rows 
     * @returns 
     */
    async update_songs_statistics(rows) {
        let totalUpdated = 0;
        const client = await this.pool.connect();
        try {
            for (const {id, correct, misses} of rows) {
                const query = {
                    text: 'UPDATE songs SET correct = $1, misses = $2 WHERE id = $3',
                    values: [correct, misses, id],
                };
                
                await client.query(query);
                totalUpdated++;
            }
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return totalUpdated;
    }

    async update_title_tags(id, tags) {
        let updated = 0;
        const client = await this.pool.connect();
        try {
            const query = {
                text: 'UPDATE titles SET tags = $1 WHERE id = $2',
                values: [tags, id],
            };
            
            await client.query(query);
            updated++;
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
        return updated;
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

        return Title.toArray(result.rows);
    }

    /**
     * 
     * @param {String} name 
     */
    async get_titles_starts_with(name) {
        name += '%';
        const query = {
            text: `SELECT * FROM titles WHERE name ILIKE $1 OR $1 ILIKE ANY(tags) ORDER BY name LIMIT 100`,
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

        return Title.toArray(result.rows);
    }

    async get_titles_starts_with_and_type(name, type) {
        name += '%';
        const query = {
            text: `SELECT * FROM titles WHERE name ILIKE $1 AND type = $2 ORDER BY name LIMIT 100`,
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

        return Title.toArray(result.rows);
    }

    /**
     * @returns {Song}
     */
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

        return Song.instantiate(result.rows[0]) || null;
    }

    /**
     * @returns {Array<Song>}
     */
    async get_songs_starts_with({name, type, title_id}) {        
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

        return Song.toArray(result.rows);
    }

    async get_songs_random(total, type) {
        const query = {
            // text: `SELECT * FROM f_random_sample(null::"songs", 'oDD ID', $1, 1.03)`,
            // text: `SELECT * FROM songs ${type && 'WHERE type = $2'} ORDER BY random() LIMIT $1`,
            text: `SELECT s.id, s.title_id, s.type, s.song_name, s.song_duration, t.name FROM songs s JOIN titles t ON t.id = s.title_id ORDER BY random() LIMIT $1`,
            values: [total]
        };

        // type && query.values.push(type);
        let result = null;

        const client = await this.pool.connect();
        try {
            result = await client.query(query);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }

        return Song.toArray(result.rows);
    }
}

module.exports = { GuessRepository };