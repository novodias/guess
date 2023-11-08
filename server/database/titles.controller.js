const Title = require("../models/title");
const { GuessRepository } = require("./db");

class Titles {
    /**
     * @private
     */
    constructor() {}

    /**
     * @private
     */
    static _repo = GuessRepository.instance;

    /**
     * @returns {Promise<Title[]>}
     */
    static async find(name) {
        return Titles._repo.get_titles_starts_with(name);
    }

    /**
     * @param {string} name 
     * @param {("Animes"|"Movies"|"Series"|"Games"|"Musics")} type 
     * @returns {Promise<Title[]>}
     */
    static async findWithType(name, type) {
        return Titles._repo.get_titles_starts_with_and_type(name, type);
    }

    /**
     * @returns {Promise<Title>}
     */
    static async findOne(name) {
        return await (Titles.find(name))[0];   
    }

    /**
     * @returns {Promise<Title>}
     */
    static async findById(id) {
        const rows = await Titles._repo.get_title_by_id(id);
        return rows[0];
    }

    /**
     * @returns {Promise<Title>}
     */
    static async add(name, type, tags) {
        return await (Titles._repo.add_title(title.type, title.name, title.tags))[0];
    }

    /**
     * @returns {Promise<number>}
     */
    static async updateTags(id, tags) {
        return Titles._repo.update_title_tags(id, tags);
    }
}

module.exports = Titles;