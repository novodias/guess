import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import crypto from 'crypto-js';

export default function PasswordPage() {
    const [password, setPassword] = useState('');
    let params = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        if (!params.id) {
            navigate('/');
        }
    });
    
    function enterPassword() {
        const hash = crypto.MD5(password).toString();
        sessionStorage.setItem("RoomPasswordHash", hash);
        navigate(`room/${params.id}`);
    }

    return (
        <div className='col container'>
            <h2>The room requires a password</h2>
            <label htmlFor="create-room-password-input">Password</label>
            <h3>Insert the room's password below</h3>
            <input type='password' id='create-room-password-input'
                value={password} onInput={(e) => setPassword(e.target.value)} />
            <button className='btn' onClick={enterPassword}>Enter</button>
        </div>
    );
}