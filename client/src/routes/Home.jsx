import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const HomePage = () => {

    const [room, setRoom] = useState('');
    let navigate = useNavigate();

    const redirectPage = () => {
        navigate(`room/${room}`);
    };
    
    const _onInput = (event) => {
        setRoom(event.target.value);
    };

    const _onKeyUp = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            redirectPage();
        }
    }

    return (
        <div className='home-join-container'>
            <label htmlFor='join-room-input'>Join a room</label>
            <div>
                <input id='join-room-input' value={room}
                    placeholder='Room code...'
                    onInput={_onInput}
                    onKeyUp={_onKeyUp} />
                <button className="btn" onClick={redirectPage}>Join</button>
            </div>
        </div>
    );
}

export default HomePage;