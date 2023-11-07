const { filterName } = require('../utils');

/**
 * @class
 * @constructor
 * @public
 */
class Song {
    /**
     * @type {?Number}
     * @description Instantiating with the constructor, the id will be null.
     */
    id;
    /**
     * @type {String}
     */
    name;
    /**
     * @type {Number}
     */
    duration;
    /**
     * @type {String}
     */
    youtube_id;
    /**
     * @type {String}
     */
    type;
    
    //# nullables
    /**
     * @type {?Number}
     */
    correct;
    /**
     * @type {?Number}
     */
    misses;

    // not nullable
    /**
     * @type {Number}
     */
    title_id;

    //# nullables
    /**
     * @type {?String}
     */
    title_name;
    /**
     * @type {?String}
     */
    title_type;
    // franchise_id;

    constructor(data = null) {
        if (data) {
            this.title_id = data['title_id'];
            this.type = data['type'];
            this.name = data['song_name'];
            this.duration = data['song_duration'];
            this.youtube_id = data['youtube_id'];
        }
    }

    static instantiate(row) {
        const obj = new Song();
        obj.id = row['id'];
        obj.name = row['song_name'];
        obj.duration = row['song_duration'];
        obj.youtube_id = row['youtube_id'];
        obj.title_id = row['title_id'];
        obj.title_name = row["name"];
        obj.type = row['type'];
        return obj;
    }

    /**
     * @param {Array<any>} rows 
     */
    static toArray(rows) {
        return rows.map((row) => Song.instantiate(row));
    }

    /**
     * @private
     */
    get titleNameFiltered() {
        return filterName(this.title_name);
    }

    /**
     * @private
     */
    get songNameFiltered() {
        return filterName(this.name);
    }

    get partialPath() {
        return this.titleNameFiltered + '/' + this.songNameFiltered;
    }
}

module.exports = Song;