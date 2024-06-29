import Titles from "../database/titles.controller"
import Title from "../models/title.model"
import { nullOrUndefined, namePattern } from "../utils";

export enum TitleType {
    Animes = "Animes",
    Games = "Games",
    Movies = "Movies",
    Series = "Series",
    Musics = "Musics"
}

export type TitleData = {
    id?: number,
    name: string,
    type: TitleType,
    tags: string[]
}

export default class TitlesService {
    
    private static _instance: TitlesService;

    constructor() {
        if (TitlesService._instance) {
            return TitlesService._instance
        }

        TitlesService._instance = this;
    }

    private async _add(titleData: TitleData): Promise<Title> {
        return await Titles.add(titleData.name, titleData.type, titleData.tags);
    }

    private static _validTitle(titleData: TitleData): boolean {
        if (nullOrUndefined(titleData.name) || nullOrUndefined(titleData.type))
            return false;

        if (titleData.name === "") {
            return false;
        }
        
        return true;
    }

    private static _sanitize(titleData: TitleData): TitleData {
        const tagPattern = /[^a-zA-Z0-9]/g
        
        const name: string = titleData.name.trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(namePattern, '');
        const tags: string[] = [];

        if (titleData.tags instanceof Array) {
            titleData.tags.forEach(tag => {
                tags.push(tag.trim().replace(tagPattern, ''));
            });
        }

        titleData.name = name;
        titleData.tags = tags;
        return titleData;
    }

    private async _tryRegister(titleData: TitleData): Promise<{ registered: boolean, title?: Title }> {
        let title: Title;

        if (typeof titleData.id !== 'undefined' && titleData.id !== 0) {
            title = await Titles.findById(titleData.id);
            return { registered: false, title };
        }
        
        titleData = TitlesService._sanitize(titleData);
        if (!TitlesService._validTitle(titleData)) throw new Error("Data is not valid");
        
        title = await Titles.findOne(titleData.name);
        if (typeof title !== 'undefined') return { registered: false, title };

        title = await this._add(titleData);
        console.assert(typeof title !== 'undefined', "TitlesService: Registered title is undefined");

        return { registered: true, title };
    }

    public async register(titleData: TitleData): Promise<{ registered: boolean, title?: Title }> {
        return await this._tryRegister(titleData);
    }

    public async get(id: number): Promise<Title> {
        return await Titles.findById(id);
    }

    public async find(query: string, type?: TitleType | string): Promise<Title[]> {
        if (typeof type === 'undefined') {
            return await Titles.find(query);
        } else {
            return await Titles.findWithType(query, type);
        }
    }

    public async findOne(query: string, type?: TitleType): Promise<Title> {
        return (await this.find(query, type))[0];
    }

    public async update(id: number, titleUpdate: {name?: string, type?: TitleType, tags?: string[]}): Promise<boolean> {
        if (typeof id === 'undefined' || id <= 0) {
            throw new Error("Property [id] is not defined or is 0");
        }

        const result = await Titles.update(id, titleUpdate);

        if (typeof result === 'undefined' ||
            result.rowCount === null ||
            result.rowCount === 0) {
            return false;
        }

        return true;
    }

    public async delete(id: number): Promise<boolean> {
        if (typeof id === 'undefined' || id <= 0) {
            throw new Error("Property [id] is not defined or is 0");
        }

        const result = await Titles.delete(id);

        if (typeof result === 'undefined' ||
            result.rowCount === null ||
            result.rowCount === 0) {
            return false;
        }

        return true;
    }
}