import { filterName } from '../utils';

export interface SongParameters {
    name: string;
    duration: number;
    type: string;
    youtube_id: string;
    title_id: number;
}

export default class Song {
    /**
     * @description Instantiating with the constructor, the id will be null.
     */
    public id?: number;
    public name: string;
    public duration: number;
    public youtube_id: string;
    public type: string;
    
    //# nullables
    public correct?: number;
    public misses?: number;

    // not nullable
    public title_id: number;

    //# nullables
    public title_name?: string;
    public title_type?: string;

    constructor(data: SongParameters | undefined = undefined) {
        if (data) {
            this.name = data['name'];
            this.duration = data['duration'];
            this.type = data['type'];
            this.youtube_id = data['youtube_id'];
            this.title_id = data['title_id'];
        }
    }

    static instantiate(row: any) {
        const obj = new Song();
        obj.id = row['id'];
        obj.name = row['name'];
        obj.duration = row['duration'];
        obj.youtube_id = row['youtube_id'];
        obj.title_id = row['title_id'];
        obj.type = row['type'];
        obj.title_name = row["title_name"];
        obj.correct = row['correct'];
        obj.misses = row['misses'];
        return obj;
    }

    static toArray(rows: any[]) {
        return rows.map((row) => Song.instantiate(row));
    }

    private get titleNameFiltered(): string {
        return filterName(this.title_name?.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "");
    }

    private get songNameFiltered() {
        return filterName(this.name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    }

    public get partialPath() {
        return this.titleNameFiltered + '/' + this.songNameFiltered;
    }
}