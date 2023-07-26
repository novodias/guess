import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Home.css';

const HomePage = () => {

    const [room, setRoom] = useState('');
    // const [redirect, setRedirect] = useState(false);
    let navigate = useNavigate();

    const redirectPage = () => {
        // setRedirect(true);
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
            {/* {redirect ? <Navigate to={`/room/${room}`} replace={true} /> : null} */}
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