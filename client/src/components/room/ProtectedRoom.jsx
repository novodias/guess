import crypto from 'crypto-js';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useRoomContext, useRoomDispatchContext } from '../../context/RoomProvider';
import { LockRounded } from '@mui/icons-material';
import Spinner from '../Spinner';
import logger from '../../utils';
import { usePopupDispatchContext } from '../../context/PopupProvider';

function AuthenticateRoom({ name, loadRoom }) {
    const [password, setPassword] = useState(null);
    
    function _onChange(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit() {
        const hash = crypto.MD5(password).toString();
        loadRoom(hash);
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
    // const navigate = useNavigate();
    const { setName } = useRoomDispatchContext();
    const { getRoom, name } = useRoomContext();
    const { add } = usePopupDispatchContext();
    
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadRoomAsync = useCallback(async (pass = null) => {
        logger.debug("Fetching room:", id);

        try {
            const room = await getRoom(pass);
            setAuth(false);
            return room;
        } catch (error) {
            const room = error.response.data;
            console.error(room);

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

            if (!initialLoad) {
                add({
                    text: room.message,
                    gap: 10,
                    orient: "bottom",
                    waitForClick: false,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [add, auth, getRoom, id, initialLoad, name, setName]);

    const LoadWithHash = useCallback(() => {
        if (location.state) {
            const hash = location.state.passwordHash;
            if (hash) {
                logger.debug("Password hash found - setting up request");
                loadRoomAsync(hash);
            }
        } else if (location.state === null && initialLoad) {
            loadRoomAsync();
            setInitialLoad(false);
        }
    }, [initialLoad, loadRoomAsync, location.state]);

    useEffect(LoadWithHash, [LoadWithHash]);

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
        return <AuthenticateRoom name={name} loadRoom={loadRoomAsync} />
    }

    return (
        children
    )
}