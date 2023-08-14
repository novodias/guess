import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

const RoomContext = createContext(undefined);
const RoomDispatchContext = createContext(undefined);

function RoomProvider({ children }) {
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');
    const [owner, setOwner] = useState('');
    const { id } = useParams();

    const getRoom = async (password) => {
        return new Promise((resolve, reject) => {
            axios.get(`/api/rooms/${id}${password !== null ? `?hash=${password}` : ''}`)
                .then((data) => resolve(data))
                .catch((reason) => reject(reason));
        });
    }

    return (
        <RoomContext.Provider value={{ roomId, name, owner, getRoom }}>
            <RoomDispatchContext.Provider value={{ setRoomId, setOwner, setName }}>
                {children}
            </RoomDispatchContext.Provider>
        </RoomContext.Provider>
    );
}

const useRoomContext = () => {
    return useContext(RoomContext);
}

const useRoomDispatchContext = () => {
    return useContext(RoomDispatchContext);
}

export {
    RoomProvider,
    useRoomContext, RoomContext,
    useRoomDispatchContext, RoomDispatchContext
};