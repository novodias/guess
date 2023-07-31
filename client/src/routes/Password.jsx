import crypto from 'crypto-js';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LockRounded } from '@mui/icons-material';
import Alert from '../components/Alert';

export default function PasswordPage() {
    const [password, setPassword] = useState('');
    let params = useParams();
    let navigate = useNavigate();
    let location = useLocation();

    useEffect(() => {
        // without a parameter id, go to '/'
        if (!params.id) {
            navigate('/');
        }
        
        // this prevents to anyone enter this page for a room
        // that doesn't exist
        if (!location.state) {
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
            {location.state && location.state.message &&
                <Alert message={location.state.message} style={{ marginTop: '20px' }} type={'danger'} />}
            <button className='btn'
                style={{ alignSelf: 'flex-end', marginTop: '20px' }}
                onClick={enterPassword}>
                Enter
            </button>
        </div>
    );
}