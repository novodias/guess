import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import crypto from 'crypto-js';

const HomePage = () => {

    // join
    const [room, setRoom] = useState('');
    
    // create
    const [name, setName] = useState('');
    const [hasPass, setHasPass] = useState(false);
    const [password, setPassword] = useState('');

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

    const createRoom = async () => {
        let roomName;
        if (!name || name === '') {
            // setName(`${sessionStorage.getItem('nickname')}'s room`);
            roomName = `${sessionStorage.getItem('nickname')}'s room`;
        } else {
            roomName = name;
        }

        const passwordHash = hasPass ? crypto.MD5(password).toString() : null;
        const response = await fetch("http://localhost:3001/api/room", {
            method: "POST",
            body: JSON.stringify({ name: roomName, passwordHash, isPrivate: false }),
            headers: {
                "Content-Type": "application/json"
            },
        });
        
        const { id } = await response.json();

        if (hasPass === true) {
            sessionStorage.setItem("RoomPasswordHash", passwordHash);
        }

        navigate(`room/${id}`);
    }

    return (
        <div className='home-container'>
            <div className='col container join-container'>
                <h2>Join a room</h2>
                <label htmlFor='join-room-input'>Room code</label>
                <h3>Insert the code below</h3>
                <input id='join-room-input' value={room}
                    placeholder='Ex.: ABC12345' type='text'
                    onInput={_onInput} autoComplete='off'
                    onKeyUp={_onKeyUp} />
                <button className="btn" onClick={redirectPage}>Join</button>
            </div>
            <div className='col container'>
                <h2>Create a room</h2>
                <label htmlFor="create-room-input">Name</label>
                <h3>Insert the room's name below</h3>
                <input type='text' id='create-room-input' placeholder={`${sessionStorage.getItem("nickname")}'s room`}
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
                        value={password} onInput={(e) => setPassword(e.target.value)} />
                </>}
                
                <button className='btn' onClick={createRoom}>Create</button>
            </div>
        </div>
    );
}

export default HomePage;