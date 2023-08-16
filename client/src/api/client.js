import axios from 'axios';

// const adr_api = process.env.NODE_ENV === 'development' ?
//     'http://localhost:3001/api' : process.env.REACT_APP_API;

export const client = axios.create({
    baseURL: '/api',
    timeout: 1000 * 30
});

/**
 * 
 * @param {*} title 
 * @param {*} song_name 
 * @param {*} youtube_id 
 * @returns {import('axios').AxiosResponse}
 */
export async function createAsync(title, song_name, youtube_id) {
    const data = {
        title_id: title.id,
        title_name: title.name,
        title_type: title.type,
        title_tags: title.tags,
        song_name,
        youtube_id
    };
    
    try {
        const response = await client.post("/create", data, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function error(error) {
    try {
        await client.post("/error", error);
    } catch (error) {
        console.error(error);
    }
}