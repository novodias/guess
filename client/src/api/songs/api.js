import { client } from "../client";

export async function getSong({name, type, id}) {
    if (!name && !type && !id) {
        throw new Error("All parameters are undefined, atleast one must be valid");
    }

    let data;
    
    try {
        const url = new URL("/songs")
        url.searchParams.set("name", name);
        id && url.searchParams.set("id", id);
        type && url.searchParams.set("type", type)

        const response = await client.get(url.toString());
        data = response.data;
    } catch (error) {
        console.error(error);
    }

    return data;
}