const { filterName } = require("../utils")

class Title {
    id
    name
    type
    tags
    
    constructor(name, type, tags) {
        this.name = name
        this.type = type
        this.tags = tags
    }

    static instantiate(row) {
        const obj = new Title();
        obj.id = row['id'];
        obj.name = row['name'];
        obj.type = row['type'];
        obj.tags = row['tags'];
        return obj;
    }

    /**
     * @param {Array<any>} rows 
     */
    static toArray(rows) {
        return rows.map((value) => Title.instantiate(value));
    }

    get nameFiltered() {
        return filterName(this.name);
    }
}

module.exports = Title;