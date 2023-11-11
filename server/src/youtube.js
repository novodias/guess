const KEY = process.env.YOUTUBE_API_KEY; 

async function videoRequest(id) {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${KEY}
    &part=contentDetails`;

    let data;

    try {
        const response = await fetch(url);
        data = await response.json();
    } catch (error) {
        throw error;
    }

    return data;
}

module.exports = videoRequest;