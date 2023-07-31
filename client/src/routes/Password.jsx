import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import crypto from 'crypto-js';
import { LockRounded } from '@mui/icons-material';

export default function PasswordPage() {
    const [password, setPassword] = useState('');
    let params = useParams();
    let navigate = useNavigate();
    let location = useLocation();

    // console.log(location.state);

    useEffect(() => {
        if (!params.id) {
            navigate('/');
        }
    });
    
    function enterPassword() {
        const hash = crypto.MD5(password).toString();
        sessionStorage.setItem("RoomPasswordHash", hash);
        navigate(`/room/${params.id}`);
    }

    return (
        <div className='col container'>
            <h2><LockRounded /> The {location.state ? location.state.name : `room`} requires a password</h2>
            <label htmlFor="create-room-password-input">Password</label>
            <h3>Insert the room's password below</h3>
            <input type='password' id='create-room-password-input'
                value={password} onInput={(e) => setPassword(e.target.value)}
                style={{ fontSize: '1.5em' }} autoComplete='off'
            />
            <button className='btn'
                style={{ alignSelf: 'flex-end', marginTop: '20px' }}
                onClick={enterPassword}>
                Enter
            </button>
        </div>
    );
}