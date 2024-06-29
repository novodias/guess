"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class Song {
    constructor(data = undefined) {
        if (data) {
            this.name = data['song_name'];
            this.duration = data['song_duration'];
            this.type = data['type'];
            this.youtube_id = data['youtube_id'];
            this.title_id = data['title_id'];
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
    static toArray(rows) {
        return rows.map((row) => Song.instantiate(row));
    }
    get titleNameFiltered() {
        return (0, utils_1.filterName)(this.title_name || "");
    }
    get songNameFiltered() {
        return (0, utils_1.filterName)(this.name);
    }
    get partialPath() {
        return this.titleNameFiltered + '/' + this.songNameFiltered;
    }
}
exports.default = Song;
