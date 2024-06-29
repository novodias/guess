// import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoomAsync } from '../api/export';

const RoomContext = createContext(undefined);
const RoomDispatchContext = createContext(undefined);

function RoomProvider({ children }) {
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');
    const [owner, setOwner] = useState('');
    const { id } = useParams();

    const getRoom = async (password) => {
        setRoomId(id);
        return await getRoomAsync(id, password);
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