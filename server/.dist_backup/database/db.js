"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pg = require('pg');
const Title = require('../models/title.model');
const { default: Song } = require('../models/song.model');
class GuessRepository {
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
    add_title(type, name, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: 'INSERT INTO titles(type, name, tags) VALUES($1, $2, $3) RETURNING *',
                values: [type, name, tags],
            };
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Title.toArray(result.rows);
        });
    }
    /**
     * @param {Song} value
     * @returns {Song}
     */
    add_song(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: 'INSERT INTO songs(title_id, type, song_name, song_duration, youtube_id, correct, misses) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                values: [value.title_id, value.type, value.name, value.song_duration, value.youtube_id, 0, 0],
            };
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Song.instantiate(result.rows[0]);
        });
    }
    /**
     *
     * @param {{id, correct, misses}} rows
     * @returns
     */
    update_songs_statistics(rows) {
        return __awaiter(this, void 0, void 0, function* () {
            let totalUpdated = 0;
            const client = yield this.pool.connect();
            try {
                for (const { id, correct, misses } of rows) {
                    const query = {
                        text: 'UPDATE songs SET correct = $1, misses = $2 WHERE id = $3',
                        values: [correct, misses, id],
                    };
                    yield client.query(query);
                    totalUpdated++;
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return totalUpdated;
        });
    }
    update_title_tags(id, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            let updated = 0;
            const client = yield this.pool.connect();
            try {
                const query = {
                    text: 'UPDATE titles SET tags = $1 WHERE id = $2',
                    values: [tags, id],
                };
                yield client.query(query);
                updated++;
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return updated;
        });
    }
    get_title_by_id(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: `SELECT * FROM titles WHERE id = $1`,
                values: [id]
            };
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Title.toArray(result.rows);
        });
    }
    /**
     *
     * @param {String} name
     */
    get_titles_starts_with(name) {
        return __awaiter(this, void 0, void 0, function* () {
            name += '%';
            const query = {
                text: `SELECT * FROM titles WHERE name ILIKE $1 OR $1 ILIKE ANY(tags) ORDER BY name LIMIT 100`,
                values: [name]
            };
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Title.toArray(result.rows);
        });
    }
    get_titles_starts_with_and_type(name, type) {
        return __awaiter(this, void 0, void 0, function* () {
            name += '%';
            const query = {
                text: `SELECT * FROM titles WHERE name ILIKE $1 AND type = $2 ORDER BY name LIMIT 100`,
                values: [name, type]
            };
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Title.toArray(result.rows);
        });
    }
    /**
     * @returns {Song | null}
     */
    get_song_by_youtube_id(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: `SELECT * FROM songs WHERE youtube_id = $1`,
                values: [id]
            };
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            if (result !== null && result.length > 0) {
                return Song.instantiate(result.rows[0]);
            }
            return null;
        });
    }
    /**
     * @returns {Array<Song>}
     */
    get_songs_starts_with({ name, type, title_id }) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Song.toArray(result.rows);
        });
    }
    get_songs_random(total, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                // text: `SELECT * FROM f_random_sample(null::"songs", 'oDD ID', $1, 1.03)`,
                // text: `SELECT * FROM songs ${type && 'WHERE type = $2'} ORDER BY random() LIMIT $1`,
                text: `SELECT s.id, s.title_id, s.type, s.song_name, s.song_duration, t.name FROM songs s JOIN titles t ON t.id = s.title_id ORDER BY random() LIMIT $1`,
                values: [total]
            };
            // type && query.values.push(type);
            let result = null;
            const client = yield this.pool.connect();
            try {
                result = yield client.query(query);
            }
            catch (error) {
                console.error(error);
            }
            finally {
                client.release();
            }
            return Song.toArray(result.rows);
        });
    }
}
module.exports = { GuessRepository };
