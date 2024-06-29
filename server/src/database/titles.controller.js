const Title = require("../models/title.model").default;
const { GuessRepository } = require("./db");

class Titles {

    /**
     * @private
     * @type {GuessRepository}
     */
    static guessRepository = GuessRepository.instance;

    /**
     * 
     */
    static async find(name) {
        return this.guessRepository.get_titles_starts_with(name);
    }

    /**
     * @param {string} name 
     * @param {string} type 
     */
    static async findWithType(name, type) {
        return this.guessRepository.get_titles_starts_with_and_type(name, type);
    }

    static async findOne(name) {
        return (await this.find(name))[0];   
    }

    static async findById(id) {
        return (await this.guessRepository.get_title_by_id(id))[0];
    }

    static async add(name, type, tags) {
        return (await this.guessRepository.add_title(type, name, tags))[0];
    }

    static async updateTags(id, tags) {
        return this.guessRepository.update_title_tags(id, tags);
    }

    static async delete(id) {
        return this.guessRepository.delete_title(id);
    }

    /**
     * @param {Object} title 
     * @param {number} id 
     * @param {string | undefined} title.name 
     * @param {string | undefined} title.type 
     * @param {string[] | undefined} title.tags 
     */
    static async update(id, title) {
        return this.guessRepository.update_title(id, title);
    }
}

module.exports = Titles;