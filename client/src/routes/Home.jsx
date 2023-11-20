import './Home.css';
import crypto from 'crypto-js';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTotalAvatars, useSettingsContext, useSettingsDispatchContext } from '../context/SettingsProvider';
import { RoomDispatchContext } from '../context/RoomProvider';
import { createRoomAsync } from '../api/export';
import NavigationIcon from '@mui/icons-material/Navigation';

function JoinContainer({ room, onInput, onKeyUp, redirectPage }) {
    return (
        <div className='col container join-container'>
            <div className='header-container'>
                <h2>Join a room</h2>
            </div>
            <div className='inner-container'>
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
        </div>
    )
}

function AvatarContainer() {
    const { avatar } = useSettingsContext();
    const setSettings = useSettingsDispatchContext();

    const [showAvatars, setShowAvatars] = useState(false);

    const setAvatar = (num) => {
        setSettings(stg => {
            return {
                ...stg,
                avatar: num
            }
        });
    }

    const total = getTotalAvatars();

    function Avatar(num) {
        const url = `cdn/avatars/${num}`;

        return (
            <span className='avatar-selectable darken'
                onClick={() => setAvatar(num)}>
                <img src={url} alt={'Avatar ' + num}></img>
            </span>
        )
    }

    const SelectableAvatars = () => {
        const avatars = [];
        for (let i = 1; i < total; i++) {
            avatars.push(Avatar(i));
        }
        return avatars;
    }

    const AvatarsContainer = () => {
        // this gets the images everytime
        // if (!showAvatars) {
        //     return null;
        // }

        const style = {
            display: showAvatars ? 'flex' : 'none'
        };

        return (
            <div className='row avatars-selectable-container' style={style}>
                <SelectableAvatars />
            </div>
        )
    }

    return (
        <div className='avatars-container' onClick={() => setShowAvatars(v => !v)}>
            <img className='your-avatar' src={`cdn/avatars/${avatar}`} alt='Your avatar'></img>
            <AvatarsContainer />
        </div>
    )
}

function SettingsContainer() {
    const { username, showAudioVisualizer } = useSettingsContext();
    const setSettings = useSettingsDispatchContext();

    const setUsername = (e) => {
        const text = e.target.value;
        setSettings(stg => {
            return {
                ...stg,
                username: text
            }
        });
    }

    const setAudioVisualizer = (e) => {
        const value = e.target.checked;
        setSettings(stg => {
            return {
                ...stg,
                showAudioVisualizer: value
            }
        });
    }

    return (
        <div className="col container you-wrapper">
            <div className='header-container'>
                <h2>You</h2>
                <AvatarContainer />
            </div>
            <div className='col inner-container'>
                <label htmlFor="input-set-username">Nickname</label>
                <h3>Insert your nickname below</h3>
                <input type='text' id='input-set-username' placeholder="Guest"
                    value={username} onInput={(e) => setUsername(e)} autoComplete='off' />
                <div className='row' style={{ marginTop: '20px', alignItems: 'center' }}>
                    <input type="checkbox" id='checkbox-visualizer'
                        checked={showAudioVisualizer}
                        onChange={setAudioVisualizer} />
                    <label htmlFor='checkbox-visualizer' style={{margin: '0', flexGrow: '1'}}>Show audio visualizer</label>
                </div>
            </div>
        </div>
    )
}

const HomePage = () => {
    const { username } = useSettingsContext();

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
            const { id, ownerUID } = await createRoomAsync(roomName, false, passwordHash);
            const state = passwordHash ? { passwordHash } : null;
            setOwner(ownerUID);
            navigate(`room/${id}`, { state });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='home-container'>
            <SettingsContainer />
            <JoinContainer onInput={_onInput} onKeyUp={_onKeyUp} 
                room={room} redirectPage={redirectPage} />

            <div className="col container rooms-wrapper">
                <div className='header-container'>
                    <h2>Find a room</h2>
                </div>
            </div>
            
            <div className='col container create-wrapper'>
                <div className='header-container'>
                    <h2>Create a room</h2>
                </div>
                <div className='col inner-container'>
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
        </div>
    );
}

export default HomePage;