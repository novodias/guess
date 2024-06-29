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
const Title = require("../models/title.model");
const { GuessRepository } = require("./db");
class Titles {
    constructor(guessRepository) {
        this.guessRepository = guessRepository;
    }
    /**
     *
     */
    find(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.get_titles_starts_with(name);
        });
    }
    /**
     * @param {string} name
     * @param {string} type
     */
    findWithType(name, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.get_titles_starts_with_and_type(name, type);
        });
    }
    findOne(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.find(name))[0];
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.guessRepository.get_title_by_id(id))[0];
        });
    }
    add(name, type, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.guessRepository.add_title(type, name, tags))[0];
        });
    }
    updateTags(id, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.guessRepository.update_title_tags(id, tags);
        });
    }
}
module.exports = Titles;
