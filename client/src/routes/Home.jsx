import './Home.css';
import crypto from 'crypto-js';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsProvider';
import { RoomDispatchContext } from '../context/RoomProvider';
import { createRoomAsync } from '../api/export';
import NavigationIcon from '@mui/icons-material/Navigation';

function JoinContainer({room, onInput, onKeyUp, redirectPage}) {
    return (
        <div className='col container join-container'>
            <h2>Join a room</h2>
            <label htmlFor='join-room-input'>Room code</label>
            <h3>Insert the code below</h3>
            <div className='input-btn-grouped row'>
                <input id='join-room-input' value={room}
                    placeholder='Ex.: ABC12345' type='text'
                    onInput={onInput} autoComplete='off'
                    onKeyUp={onKeyUp} />
                <button className="btn" onClick={redirectPage}>
                    <NavigationIcon style={{rotate: "90deg"}}/>
                </button>
            </div>
        </div>
    )
}

const HomePage = () => {
    const { username } = useContext(SettingsContext);
    const { setOwner } = useContext(RoomDispatchContext);

    // join
    const [room, setRoom] = useState('');
    
    // create
    const [name, setName] = useState('');
    const [hasPass, setHasPass] = useState(false);
    const [localPassword, setLocalPassword] = useState('');

    let navigate = useNavigate();

    const redirectPage = () => {
        navigate(`/room/${room}`);
    };
    
    const _onInput = (event) => {
        setRoom(event.target.value);
    };

    const _onKeyUp = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            redirectPage();
        }
    }

    const _onChangeCheckBoxPassword = (e) => {
        const checked = e.target.checked;
        setHasPass(checked);
    }

    const setupRoom = async () => {
        let roomName;
        if (!name || name === '') {
            roomName = `${username}'s room`;
        } else {
            roomName = name;
        }

        const passwordHash = hasPass ? crypto.MD5(localPassword).toString() : null;
        
        try {
            const { id, ownerId } = await createRoomAsync(roomName, false, passwordHash);

            setOwner(ownerId);
            navigate(`room/${id}`, { state: { passwordHash }});
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='home-container'>
            {/* <div className='col container join-container'>
                <h2>Join a room</h2>
                <label htmlFor='join-room-input'>Room code</label>
                <h3>Insert the code below</h3>
                <input id='join-room-input' value={room}
                    placeholder='Ex.: ABC12345' type='text'
                    onInput={_onInput} autoComplete='off'
                    onKeyUp={_onKeyUp} />
                <button className="btn" onClick={redirectPage}>Join</button>
            </div> */}
            <JoinContainer onInput={_onInput} onKeyUp={_onKeyUp} 
                room={room} redirectPage={redirectPage} />
            
            <div className='col container'>
                <h2>Create a room</h2>
                <label htmlFor="create-room-input">Name</label>
                <h3>Insert the room's name below</h3>
                <input type='text' id='create-room-input' placeholder={`${username}'s room`}
                    value={name} onInput={(e) => setName(e.target.value)} autoComplete='off' />
                
                <div className='row' style={{ marginTop: '20px', alignItems: 'center' }}>
                    <input type="checkbox" id='checkbox-has-password' value={hasPass} onChange={_onChangeCheckBoxPassword} />
                    <label htmlFor='checkbox-has-password' style={{margin: '0', flexGrow: '1'}}>Use a password</label>
                </div>
                
                {hasPass &&
                <>
                    <label htmlFor="create-room-password-input">Password</label>
                    <h3>Insert the room's password below</h3>
                    <input type='password' id='create-room-password-input' autoComplete='off'
                        value={localPassword} onInput={(e) => setLocalPassword(e.target.value)} />
                </>}
                
                <button className='btn' onClick={setupRoom}>Create</button>
            </div>
        </div>
    );
}

export default HomePage;