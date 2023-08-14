import React, { useState, useEffect, useCallback } from 'react';
import { useRoomContext, useRoomDispatchContext } from '../../context/RoomProvider';
// import { useNavigate, useParams } from 'react-router-dom';
import { LockRounded } from '@mui/icons-material';
import Alert from '../Alert';
import Spinner from '../Spinner';
import crypto from 'crypto-js';
import { useLocation, useParams } from 'react-router-dom';

function AuthenticateRoom({ name, setPass, loadRoom, message }) {
    const [password, setPassword] = useState('');

    function _onChange(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit() {
        try {
            setPass(password)
            await loadRoom();
        } catch (error) {}
    }

    return (
        <div className='col container'>
            <h2><LockRounded /> The {name || `room`} requires a password</h2>
            <label htmlFor="create-room-password-input">Password</label>
            <h3>Insert the room's password below</h3>
            <input type='password' id='create-room-password-input'
                value={password} onChange={_onChange}
                style={{ fontSize: '1.5em' }} autoComplete='off'
            />
            {message && <Alert message={message} style={{ marginTop: '20px' }} type={'danger'} />}
            <button className='btn'
                style={{ alignSelf: 'flex-end', marginTop: '20px' }}
                onClick={handleSubmit}>
                Enter
            </button>
        </div>
    );
}

export default function ProtectedRoom({ children }) {
    const { id } = useParams();
    const location = useLocation();
    const { setName, setRoomId } = useRoomDispatchContext();
    const { getRoom, name } = useRoomContext();
    
    // const [isAuth, setIsAuth] = useState(false);
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    async function loadRoomAsync() {
        console.log("Fetching room:", id);
        try {
            setLoading(true);
            
            const res = await getRoom(password);
            const data = res.data;
            
            setRoomId(data.id);
            setName(data.name);
            
            if (data.requirePassword) {
                console.log("Room", id, "needs a password - setAuth to true");
                setAuth(true);
            } else {
                setAuth(false);
            }

            return data;
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    const loadRoomAsyncCallback = useCallback(loadRoomAsync,
        [getRoom, setName, setRoomId, id, password]);

    function setPass(pass) {
        if (pass === null) {
            setPassword(null);
            return;
        }

        const hash = crypto.MD5(pass).toString();
        setPassword(hash);
    }

    useEffect(() => {
        console.log("Page rendered - Effect");
        
        if (location.state) {
            const hash = location.state.passwordHash;
            if (hash) {
                console.log("Password hash found - setting up request");
                setPassword(hash);
            }
        }

        if (loading) {
            loadRoomAsyncCallback();
        }
    }, [loadRoomAsyncCallback, loading, location.state]);

    if (loading) {
        return <Spinner sx={128} sy={128} />
    } 
    
    if (auth) {
        return <AuthenticateRoom name={name} message={message}
            setPass={setPass} loadRoom={loadRoomAsync} />
    }

    return (
        children
    )
}