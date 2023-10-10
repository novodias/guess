import crypto from 'crypto-js';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRoomContext, useRoomDispatchContext } from '../../context/RoomProvider';
import { LockRounded } from '@mui/icons-material';
import Alert from '../Alert';
import Spinner from '../Spinner';
import logger from '../../utils';

function AuthenticateRoom({ name, setPass, loadRoom, message }) {
    const [password, setPassword] = useState(null);
    
    function _onChange(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit() {
        setPass(password);
    }

    return (
        <div className='col container'>
            <div className='header-container' style={{color: "white", background: "crimson"}}>
                <h2><LockRounded /> The room requires a password</h2>
            </div>
            <div className='col inner-container'>
                <h2 style={{marginLeft: "0px"}}>{name}</h2>
                <label htmlFor="create-room-password-input" style={{marginTop: "20px"}}>Password</label>
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
        </div>
    );
}

export default function ProtectedRoom({ children }) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { setName } = useRoomDispatchContext();
    const { getRoom, name } = useRoomContext();
    
    // const [isAuth, setIsAuth] = useState(false);
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    async function loadRoomAsync() {
        logger.debug("Fetching room:", id);
        try {    
            const room = await getRoom(password);
            
            // setRoomId(room.id);
            if (!name) {
                setName(room.name);
            }
            
            if (room.requirePassword) {
                if (!auth) {
                    logger.debug("Room", id, "needs a password - setAuth to true");
                    setAuth(true);
                }
            } else {
                setAuth(false);
            }

            return room;
        } catch (error) {
            console.error(error);
            setMessage(error.response.data);
        } finally {
            setLoading(false);
        }
    }

    const loadRoomAsyncCallback = useCallback(loadRoomAsync,
        [getRoom, setName, id, password, auth, name]);

    function setPass(pass) {
        if (pass === null) {
            setPassword(null);
            return;
        }

        const hash = crypto.MD5(pass).toString();
        setPassword(hash);
    }

    useEffect(() => {
        if (password && auth) {
            loadRoomAsyncCallback();
        }
    }, [password, auth, loadRoomAsyncCallback]);

    useEffect(() => {
        if (location.state) {
            const hash = location.state.passwordHash;
            if (hash) {
                // console.log("Password hash found - setting up request");
                logger.debug("Password hash found - setting up request");
                setPassword(hash);
            }
        }

        if (loading) {
            loadRoomAsyncCallback();
        }
    }, [loadRoomAsyncCallback, loading, location.state]);

    if (loading) {
        return (
            <div className='row' style={{
                width: '100%', height: '100vh',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <Spinner sx={128} sy={128} />
            </div>
        )
    }
    
    if (auth) {
        return <AuthenticateRoom name={name} message={message}
            setPass={setPass} loadRoom={loadRoomAsync} />
    } else if (!auth && message) {
        navigate("/", { state: { id, message }})
    }

    return (
        children
    )
}