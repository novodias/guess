import { AxiosError } from "axios";
import { client } from "../client";

export async function getRoomAsync(id, hash = null) {
    let data;
    
    try {
        const base64 = btoa(hash);
        const response = await client.get(`/rooms`, {
            params: { id },
            headers: { Authorization: base64 }
        });

        data = response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            //  wrong password
            if (error.response.status === 400) {
                data = error.response.data;
                return data;
            } else {
                throw error;
            }
        } else {
            // console.error(error);
            throw error;
        }
    }

    return data;
}

export async function createRoomAsync(name, isPrivate, hash = null) {
    let data;

    try {
        const response = await client.post("/rooms", {
                name,
                isPrivate,
                passwordHash: hash
            }, {
                "Content-Type": "application/json",
            },
        );

        data = response.data;
    } catch (error) {
        console.error(error);
    }

    return data;
}