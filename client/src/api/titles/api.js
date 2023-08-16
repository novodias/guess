import { client } from "../client";

export async function getTitlesAsync({name, type}) {
    if (name === undefined) {
        throw new Error("Name paremeter is undefined");
    }

    let data;
    
    try {
        // const url = new URL("/titles")
        // url.searchParams.set("name", name);
        // type && url.searchParams.set("type", type)
        const params = {
            name
        };

        if (type) {
            params.type = type;
        }

        const response = await client.get("/titles", { params });

        data = response.data;
    } catch (error) {
        console.error(error);
    }

    return data;
}