const { GuessRepository } = require("./db");

class Songs {

    /**
     * @private
     */
    constructor() {}

    /**
     * @private
     */
    static _repo = GuessRepository.instance;

    static async find(name, type = null, title_id = null) {
        return Songs._repo.get_songs_starts_with({ name, type, title_id });
    }

    static async findOne(name) {
        return (await Songs.find(name))[0];   
    }

    static async findWithYoutubeId(id) {
        return Songs._repo.get_song_by_youtube_id(id);
    }

    static async random(num) {
        return Songs._repo.get_songs_random(num);
    }

    static async add(song) {
        return Songs._repo.add_song(song);
    }

    /**
     * @param {Array<{id, correct, misses}>} rows
     * @returns {number} Total of rows that got updated.
     */
    static async updateStatistics(rows) {
        return Songs._repo.update_songs_statistics(rows);
    }
}

module.exports = Songs;