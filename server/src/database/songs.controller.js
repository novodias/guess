const { GuessRepository } = require("./db");
const { default: Song } = require('../models/song');

class Songs {

    constructor(guessRepository) {
        this.guessRepository = guessRepository;
    }

    /**
     * @private
     * @type {GuessRepository}
     */
    guessRepository;

    /**
     * @param {string} name 
     * @param {?string} [type=null] 
     * @param {?number} [title_id=null] 
     */
    async find(name, type = null, title_id = null) {
        return this.guessRepository.get_songs_starts_with({ name, type, title_id });
    }

    /**
     * @param {String} name 
     */
    async findOne(name) {
        return (await this.find(name))[0];   
    }

    /**
     * @param {String} id 
     */
    async findWithYoutubeId(id) {
        return this.guessRepository.get_song_by_youtube_id(id);
    }

    /**
     * @param {Number} num 
     */
    async random(num) {
        return this.guessRepository.get_songs_random(num);
    }

    /**
     * @param {Song} song 
     */
    async add(song) {
        return this.guessRepository.add_song(song);
    }

    /**
     * @param {Array<{id, correct, misses}>} rows
     * @returns {number} Total of rows that got updated.
     */
    async updateStatistics(rows) {
        return this.guessRepository.update_songs_statistics(rows);
    }
}

module.exports = Songs;