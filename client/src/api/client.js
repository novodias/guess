import axios from 'axios';

// const adr_api = process.env.NODE_ENV === 'development' ?
//     'http://localhost:3001/api' : process.env.REACT_APP_API;

// const baseURL = import.meta.env.PROD ? `http://${import.meta.env.VITE_APP_URL}:3000` : '';

export const client = axios.create({
    baseURL: '/api',
    timeout: 1000 * 30,
});

/**
 * 
 * @param {string} name 
 * @param {string} song_name 
 * @returns {string}
 */
export function getMusicUrl(name, song_name) {
    name = name.replace(":", "").replace("'", "");
    song_name = song_name.replace(":", "").replace("'", "");
    return `api/musics/${name}/${song_name}`;
}

export function getMusic(roomid, hash) {
    if (import.meta.env.DEV) {
        return `api/musics/${roomid}?hash=${hash}`;
    } else {
        return `api/musics/${roomid}?hash=${hash}`;
    }
}

/**
 * @returns {Promise<{
 * total: number, 
 * avatars: string[]
 * }> | undefined}
 */
export async function getAvatars() {
    try {
        const response = await client.get("/avatars/all");
        const { total, result } = response.data;
        return { total, avatars: result };
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export function getAvatarUrl(num) {
    if (import.meta.env.DEV) {
        return `cdn/avatars/${num}`;
    } else {
        return `api/avatars/${num}`;
    }
}

/**
 * 
 * @param {*} title 
 * @param {*} song_name 
 * @param {*} youtube_id 
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export async function createAsync(title, song_name, youtube_id) {
    // const data = {
    //     title_id: title.id,
    //     title_name: title.name,
    //     title_type: title.type,
    //     title_tags: title.tags,
    //     song_name,
    //     youtube_id
    // };

    if (title.id == 0) {
        const data_title = {
            title: title.name,
            tags: title.tags,
            type: title.type
        }

        /**
         * @type {{id, name, type, tags}}
         */
        const title_response = await client.post("/titles", data_title, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        title = title_response.data;
    }

    const data_song = {
        youtube_id,
        title_id: title.id,
        name: song_name,
        type: title.type,
    }

    const song_response = await client.post("/songs", data_song, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    return song_response;
    
    // try {
    //     const response = await client.post("/create", data, {
    //         headers: {
    //             "Content-Type": "application/json",
    //         }
    //     });

    //     return response;
    // } catch (error) {
    //     console.error(error);
    //     throw error;
    // }
}

export async function error(error) {
    try {
        await client.post("/error", error);
    } catch (error) {
        console.error(error);
    }
}