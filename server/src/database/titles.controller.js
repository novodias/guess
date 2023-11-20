const Title = require("../models/title.model");
const { GuessRepository } = require("./db");

class Titles {

    constructor(guessRepository) {
        this.guessRepository = guessRepository;
    }

    /**
     * @private
     * @type {GuessRepository}
     */
    guessRepository;

    /**
     * 
     */
    async find(name) {
        return this.guessRepository.get_titles_starts_with(name);
    }

    /**
     * @param {string} name 
     * @param {string} type 
     */
    async findWithType(name, type) {
        return this.guessRepository.get_titles_starts_with_and_type(name, type);
    }

    async findOne(name) {
        return (await this.find(name))[0];   
    }

    async findById(id) {
        return (await this.guessRepository.get_title_by_id(id))[0];
    }

    async add(name, type, tags) {
        return (await this.guessRepository.add_title(type, name, tags))[0];
    }

    async updateTags(id, tags) {
        return this.guessRepository.update_title_tags(id, tags);
    }
}

module.exports = Titles;