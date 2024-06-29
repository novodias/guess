const { GuessRepository } = require("./db");
const { default: Song } = require('../models/song.model');

class Songs {

    /**
     * @private
     * @type {GuessRepository}
     */
    static guessRepository = GuessRepository.instance;

    /**
     * @param {string} name 
     * @param {?string} [type=null] 
     * @param {?number} [title_id=null] 
     */
    static async find(name, type = null, title_id = null) {
        return this.guessRepository.get_songs_starts_with({ name, type, title_id });
    }

    /**
     * @param {String} name 
     */
    static async findOne(name) {
        return (await this.find(name))[0];   
    }

    /**
     * @param {String} id 
     */
    static async findWithYoutubeId(id) {
        return this.guessRepository.get_song_by_youtube_id(id);
    }

    /**
     * @param {Number} num 
     */
    static async random(num) {
        return this.guessRepository.get_songs_random(num);
    }

    /**
     * @param {Song} song 
     */
    static async add(song) {
        return this.guessRepository.add_song(song);
    }

    /**
     * @param {Array<{id, correct, misses}>} rows
     * @returns {Promise<number>} Total of rows that got updated.
     */
    static async updateStatistics(rows) {
        return this.guessRepository.update_songs_statistics(rows);
    }

    /**
     * @param {number} id 
     * @param {{name?, type?, duration?, youtube_id?, title_id?, correct?, misses?}} song 
     */
    static async update(id, song) {
        return this.guessRepository.update_song(id, song);
    }

    static async delete(id) {
        return this.guessRepository.delete_song(id);
    }
}

module.exports = Songs;