import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import crypto from 'crypto-js';

const HomePage = () => {

    const [room, setRoom] = useState('');
    
    const [name, setName] = useState('');
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

    const createRoom = async () => {
        if (!name || name === '') {
            setName(`${sessionStorage.getItem('nickname')}'s room`);
        }

        const passwordHash = crypto.MD5(password).toString();
        const response = await fetch("http://localhost:3001/api/room", {
            method: "POST",
            body: JSON.stringify({ name, passwordHash }),
            headers: {
                "Content-Type": "application/json"
            },
        });
        
        const { id } = await response.json();

        sessionStorage.setItem("RoomPasswordHash", passwordHash);
        
        // password here
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
                    onInput={_onInput}
                    onKeyUp={_onKeyUp} />
                <button className="btn" onClick={redirectPage}>Join</button>
            </div>
            <div className='col container'>
                <h2>Create a room</h2>
                <label htmlFor="create-room-input">Name</label>
                <h3>Insert the room's name below</h3>
                <input type='text' id='create-room-input'
                    value={name} onInput={(e) => setName(e.target.value)} />
                <label htmlFor="create-room-password-input">Password</label>
                <h3>Insert the room's password below</h3>
                <input type='password' id='create-room-password-input'
                    value={password} onInput={(e) => setPassword(e.target.value)} />
                <button className='btn' onClick={createRoom}>Create</button>
            </div>
        </div>
    );
}

export default HomePage;