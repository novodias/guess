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
const { GuessRepository } = require("./db");
const { default: Song } = require('../models/song.model');
class Songs {
    constructor(guessRepository) {
        this.guessRepository = guessRepository;
    }
    /**
     * @param {string} name
     * @param {?string} [type=null]
     * @param {?number} [title_id=null]
     */
    find(name, type = null, title_id = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.get_songs_starts_with({ name, type, title_id });
        });
    }
    /**
     * @param {String} name
     */
    findOne(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.find(name))[0];
        });
    }
    /**
     * @param {String} id
     */
    findWithYoutubeId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.get_song_by_youtube_id(id);
        });
    }
    /**
     * @param {Number} num
     */
    random(num) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.get_songs_random(num);
        });
    }
    /**
     * @param {Song} song
     */
    add(song) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.add_song(song);
        });
    }
    /**
     * @param {Array<{id, correct, misses}>} rows
     * @returns {number} Total of rows that got updated.
     */
    updateStatistics(rows) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.update_songs_statistics(rows);
        });
    }
}
module.exports = Songs;
