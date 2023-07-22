import React from 'react';
import './Home.css';

const HomePage = () => {
    
    return (
        <div className='home-join-container'>
            <label htmlFor='join-room-input'>Join a room</label>
            <div>
                <input id='join-room-input' placeholder='Room code...' />
                <button className="btn">Join</button>
            </div>
        </div>
    );
}

export default HomePage;