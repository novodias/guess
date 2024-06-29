import Songs from "../database/songs.controller"
import Titles from "../database/titles.controller"
import Song from "../models/song.model"
import Title from "../models/title.model"
import { filterName, namePattern, youtubePattern } from "../utils"
import { TitleType } from "./titles.service"

export type SongData = {
    id?: number,
    title_id: number
    youtube_id: string,
    name: string,
    type: TitleType,
    duration: number,
}

export default class SongsService {
    
    private static _instance: SongsService;

    constructor() {
        if (SongsService._instance) {
            return SongsService._instance
        }

        SongsService._instance = this;
    }

    private async _add(songData: SongData): Promise<Song> {
        return await Songs.add(new Song(songData));
    }

    private async _tryGetYoutubeId(youtube_id: string): Promise<Song | undefined> {
        return await Songs.findWithYoutubeId(youtube_id);
        // return { registered: song === undefined, song: song };
    }

    private async _getTitle(id: number): Promise<Title> {
        return await Titles.findById(id)
    }

    private static _validSong(songData: SongData): boolean {
        const { title_id, youtube_id, name } = songData;
        if (typeof name === 'undefined' || name === "") return false;
        if (typeof title_id === 'undefined' || title_id <= 0) return false;
        
        if (typeof youtube_id === 'undefined' ||
            youtube_id === "" ||
            youtube_id.length > 11 ||
            youtube_id.length < 11 ||
            youtubePattern.test(youtube_id)
        ) return false;
        
        return true;
    }

    private static _sanitize(songData: SongData): SongData {
        songData.name = songData.name.trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(namePattern, "");
        songData.youtube_id = songData.youtube_id.trim();

        return songData;
    }

    private async _download(songData: SongData): Promise<{ success: boolean, duration: number }> {
        const title = await this._getTitle(songData.title_id);
        const response = await fetch("http://127.0.0.1:5000/fetch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title_name: title.nameFiltered,
                song_name: filterName(songData.name),
                youtube_id: songData.youtube_id
            })
        });

        if (response.status !== 201) {
            console.error("Service song downloader not running");
            return { success: false, duration: 0 };
        }

        const { duration } = await response.json();
        return { success: true, duration };
    }
    
    private async _tryRegister(songData: SongData): Promise<{ registered: boolean, song?: Song }> {
        const result = await this._tryGetYoutubeId(songData.youtube_id);
        if (typeof result !== 'undefined') {
            return { registered: false, song: result };
        }

        const songs = await this.find(songData.name);
        if (songs.length > 0) {
            return { registered: false, song: songs[0] };
        }

        songData = SongsService._sanitize(songData);
        if (!SongsService._validSong(songData)) throw new Error("Data is not valid");

        const { success, duration } = await this._download(songData);
        if (!success) return { registered: false, song: undefined };

        songData.duration = duration;
        const song = await this._add(songData);
        console.assert(typeof song !== 'undefined', "SongsService: Registered song is undefined");

        return { registered: true, song: song };
    }

    public async register(songData: SongData): Promise<{ registered: boolean, song?: Song }> {
        return await this._tryRegister(songData);
    }

    public async find(query: string, type?: TitleType | string): Promise<Song[]> {
        return await Songs.find(query, type, null);
    }

    public async findOne(query: string, type?: TitleType | string): Promise<Song> {
        return (await Songs.find(query, type, null))[0];
    }

    public async update(id: number,
        songUpdate: {
            name?: string, type?: TitleType, duration?: number,
            youtube_id?: string, title_id?: number, correct?: number,
            misses?: number
        }) {
        if (typeof id === 'undefined' || id <= 0) {
            throw new Error("Property [id] is not defined or is 0");
        }

        const result = await Songs.update(id, songUpdate);

        if (typeof result === 'undefined' ||
            result.rowCount === null ||
            result.rowCount === 0) {
            return false;
        }

        return true;
    }

    public async delete(id: number) {
        if (typeof id === 'undefined' || id <= 0) {
            throw new Error("Property [id] is not defined or is 0");
        }

        const result = await Songs.delete(id);

        if (typeof result === 'undefined' ||
            result.rowCount === null ||
            result.rowCount === 0) {
            return false;
        }

        return true;
    }

    public async random(total: number) {
        return Songs.random(total);
    }
}