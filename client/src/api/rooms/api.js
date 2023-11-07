import { AxiosError } from "axios";
import { client } from "../client";

export class RoomNotFound extends Error {
    /**
     * @param {AxiosError} err 
     */
    constructor(err) {
        super(err.response.data.error.message);
        this.name = "RoomNotFound";
    }
}

export class RoomAuthError extends Error {
    /**
     * @param {AxiosError} err 
     */
    constructor(err) {
        const error = err.response.data.error;
        const data = err.response.data.data;
        
        super(error.message);
        this.name = "RoomAuthError";
        this.data = data;
    }
}

export async function getRoomAsync(id, hash = null) {
    let data;
    
    try {
        const base64 = btoa(hash);
        const response = await client.get(`/rooms`, {
            params: { id },
            headers: { Authorization: base64 }
        });

        data = response.data;
        console.log(data);
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response.status === 400) {
                throw new RoomAuthError(err);
            } else if (err.response.status === 404) {
                throw new RoomNotFound(err);
            } else {
                throw err;
            }
        } else {
            // console.err(err);
            throw err;
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