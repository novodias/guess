import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsContext } from '../../context/SettingsProvider';
import { useRoomDispatchContext } from '../../context/RoomProvider';
import { createRoomAsync } from '../../api/export';
import usePassword from '../../hooks/usePassword';
import TextInput from '../elements/TextInput';

function PasswordInput({ password, setPassword, setupRoom }) {
    return (
        <TextInput id='create-room-password-input' labelText='Password'
            helpText="Leave empty to not use a password"
            autoComplete='off' type='password' onEnter={setupRoom}
            value={password} onInput={(value) => setPassword(value)} />
    )
}

export default function Create() {
    let navigate = useNavigate();

    const { username } = useSettingsContext();
    const { setOwner } = useRoomDispatchContext();

    const password = usePassword();
    const [roomName, setRoomName] = useState('');
    const validRoomName = () => {
        let name;
        if (!roomName || roomName === '') {
            name = `${username}'s room`;
        } else {
            name = roomName;
        }
        return name;
    }

    const setupRoom = async () => {
        try {
            const name = validRoomName();
            const hash = password.hashed();
            const state = hash ? { passwordHash: hash } : null;
            const { id, ownerUID } = await createRoomAsync(name, false, hash);
            setOwner(ownerUID);
            navigate(`room/${id}`, { state });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='cell create'>
            <div className='header marker m-animated'>
                <h1>Create</h1>
            </div>
            <TextInput id='create-room-input' labelText='Name' helpText="Insert your room's name below."
                autoComplete='off' placeholder={`${username}'s room`} onEnter={setupRoom}
                value={roomName} onInput={(value) => setRoomName(value)} />
            <PasswordInput password={password.value}
                setPassword={password.set}
                setupRoom={setupRoom} />
            <div className="buttons-group">
                <button className='btn' onClick={setupRoom}>Create</button>
            </div>
        </div>
    )
}