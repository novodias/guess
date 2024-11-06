const pg = require('pg');
const Title = require('../models/title.model').default;
const { default: Song } = require('../models/song.model');

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

    /**
     * @private
     */
    async _execute(query) {
        const client = await this.pool.connect();
        try {
            return await client.query(query);
        } catch (err) {
            console.error(err);
        } finally {
            client.release(err => console.error(err));
        }
    }
    
    async add_title(type, name, tags) {
        const query = {
            text: 'INSERT INTO titles(type, name, tags) VALUES($1, $2, $3) RETURNING *',
            values: [type, name, tags],
        };

        const result = await this._execute(query);  
        return Title.toArray(result.rows);
    }

    /**
     * @param {Song} value 
     * @returns {Song}
     */
    async add_song(value) {
        const query = {
            text: 'INSERT INTO songs(title_id, type, name, duration, youtube_id, correct, misses) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: [value.title_id, value.type, value.name, value.duration, value.youtube_id, 0, 0],
        };

        const result = await this._execute(query);
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

        const result = await this._execute(query);
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

        const result = await this._execute(query);
        return Title.toArray(result.rows);
    }

    async get_titles_starts_with_and_type(name, type) {
        name += '%';
        const query = {
            text: `SELECT * FROM titles WHERE name ILIKE $1 AND type = $2 ORDER BY name LIMIT 100`,
            values: [name, type]
        };

        const result = await this._execute(query);
        return Title.toArray(result.rows);
    }

    /**
     * @returns {Song | undefined}
     */
    async get_song_by_youtube_id(id) {
        const query = {
            text: `SELECT * FROM songs WHERE youtube_id = $1`,
            values: [id]
        };

        const result = await this._execute(query);
        const songs = Song.toArray(result.rows);
        return songs[0];
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
            queryName = `name ILIKE $${batch++}`;
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
            text: `SELECT * FROM songs WHERE ${queryName} ${queryType} ${queryTitle} ORDER BY name LIMIT 100`,
            values
        };

        const result = await this._execute(query);
        console.log(result);
        return Song.toArray(result.rows);
    }

    async get_songs_random(total, type) {
        const query = {
            // text: `SELECT * FROM f_random_sample(null::"songs", 'oDD ID', $1, 1.03)`,
            // text: `SELECT * FROM songs ${type && 'WHERE type = $2'} ORDER BY random() LIMIT $1`,
            text: `SELECT s.id, s.title_id, s.type, s.name, s.duration, t.name AS title_name FROM songs s JOIN titles t ON t.id = s.title_id ORDER BY random() LIMIT $1`,
            values: [total]
        };

        // type && query.values.push(type);
        const result = await this._execute(query);
        return Song.toArray(result.rows);
    }

    genProperty(key, value) {
        return typeof value !== 'undefined' ? key : '';
    }

    async update_title(id, { name, type, tags }) {
        const properties = `(${name ? "name," : ''} ${type ? "type," : ''}, ${tags ? "tags" : ''})`;
        
        const values = [];
        let batch = 0;
        let interp = '(';
        
        let index = 0;
        for (const value of [name, type, tags]) {
            if (typeof value !== 'undefined') {
                values.push(value);
                interp.concat('$' + ++batch + (index < 2 ? ', ' : ')'));
            }
            index++;
        }

        values.push(id);
        batch++;

        const query = {
            text: `UPDATE titles SET ${properties} = ${interp} WHERE id = $${batch}`,
            values
        };

        return await this._execute(query);
    }
    
    async delete_title(id) {
        const query = {
            text: "DELETE FROM titles WHERE id = $1",
            values: [id]
        };

        return await this._execute(query);
    }

    async update_song(id, { name, type, duration, youtube_id, title_id, correct, misses }) {
        let properties = '';
        let interp = '';
        let batch = 0;
        let idx = 0;
        const values = [];
        const entries = Object.entries({ name, type, duration, youtube_id, title_id, correct, misses });
        for (const [k, v] in entries) {
            if (typeof v === 'undefined') {
                idx++;
                continue;
            }

            if (idx !== arr.length - 1) {
                properties += k + ', ';
                interp += '$' + (++batch) + ', ';
            } else {
                properties += k;
                interp += '$' + (++batch);
            }

            values.push(v);
            idx++;
        }
        properties = '(' + properties + ')';
        interp = '(' + interp + ')';
        
        values.push(id);
        const idInterp = "$" + values.length;

        const query = {
            text: `UPDATE titles SET ${properties} = ${interp} WHERE id = ${idInterp}`,
            values
        };

        return await this._execute(query);
    }

    async delete_song(id) {
        const query = {
            text: "DELETE FROM songs WHERE id = $1",
            values: [id]
        };

        return await this._execute(query);
    }
}

module.exports = { GuessRepository };