import './Home.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTotalAvatars, useSettingsContext, useSettingsDispatchContext } from '../context/SettingsProvider';
import { useRoomDispatchContext } from '../context/RoomProvider';
import { createRoomAsync } from '../api/export';
import NavigationIcon from '@mui/icons-material/Navigation';
import Checkbox from '../components/elements/Checkbox';
import TextInput from '../components/elements/TextInput';
import usePassword from '../hooks/usePassword';

function JoinContainer() {
    let navigate = useNavigate();
    const [id, setId] = useState('');

    const navigateRoom = () => navigate(`/room/${id}`);
    const onRoomInput = (e) => setId(e.target.value);
    const onKeyUp = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            navigateRoom();
        }
    }

    return (
        <div className='col container join-container'>
            <div className='header-container'>
                <h2>Join a room</h2>
            </div>
            <div className='inner-container'>
                <label htmlFor='join-room-input'>Room code</label>
                <h3>Insert the code below</h3>
                <div className='input-btn-grouped row'>
                    <input id='join-room-input' value={id}
                        placeholder='Ex.: ABC12345' type='text'
                        onInput={onRoomInput} autoComplete='off'
                        onKeyUp={onKeyUp} />
                    <button className="btn" onClick={navigateRoom}>
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

    const setUsername = (text) => {
        setSettings(stg => {
            return {
                ...stg,
                username: text
            }
        });
    }

    const setAudioVisualizer = (checked) => {
        setSettings(stg => {
            return {
                ...stg,
                showAudioVisualizer: checked
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
                <TextInput id="input-set-username" labelText='Nickname' helpText='Your nickname below'
                    autoComplete='off' placeholder='Guest' value={username}
                    onInput={(value) => setUsername(value)} />
                <Checkbox id='checkbox-visualizer' checked={showAudioVisualizer}
                    onChecked={setAudioVisualizer} text='Show audio visualizer'
                    style={{ marginTop: '20px', alignItems: 'center' }} />
            </div>
        </div>
    )
}

function CreateContainer() {
    let navigate = useNavigate();

    const { username } = useSettingsContext();
    const { setOwner } = useRoomDispatchContext();

    const { password, setPassword, hashed } = usePassword();
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [roomName, setRoomName] = useState('');

    const onPasswordChecked = (checked) => {
        setPasswordEnabled(checked);
    }

    function PasswordInput() {
        if (!passwordEnabled) return null;
        return (
            <TextInput id='create-room-password-input' labelText='Password' helpText="Room's password below"
                autoComplete='off' type='password' onEnter={setupRoom}
                value={password} onInput={(value) => setPassword(value)} />
        )
    }

    const setupRoom = async () => {
        let l_roomName;
        if (!roomName || roomName === '') {
            l_roomName = `${username}'s room`;
        } else {
            l_roomName = roomName;
        }

        const passwordHash = passwordEnabled ? hashed() : null;
        
        try {
            const { id, ownerUID } = await createRoomAsync(l_roomName, false, passwordHash);
            const state = passwordEnabled ? { passwordHash } : null;
            setOwner(ownerUID);
            navigate(`room/${id}`, { state });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='col container create-wrapper'>
            <div className='header-container'>
                <h2>Create a room</h2>
            </div>
            <div className='col inner-container'>
                <TextInput id='create-room-input' labelText='Name' helpText="Room's name below"
                    autoComplete='off' placeholder={`${username}'s room`} onEnter={setupRoom}
                    value={roomName} onInput={(value) => setRoomName(value)} />
                <Checkbox id='checkbox-has-password' checked={passwordEnabled}
                    onChecked={onPasswordChecked} text='Use password'
                    style={{margin: '0', flexGrow: '1'}} />
                <PasswordInput />
                
                <button className='btn' onClick={setupRoom}>Create</button>
            </div>
        </div>
    )
}

const HomePage = () => {
    return (
        <div className='home-container'>
            <SettingsContainer />
            <JoinContainer />
            <div className="col container rooms-wrapper">
                <div className='header-container'>
                    <h2>Find a room</h2>
                </div>
            </div>
            <CreateContainer />
        </div>
    );
}

export default HomePage;