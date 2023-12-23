import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useRoomContext, useRoomDispatchContext } from '../../context/RoomProvider';
import { LockRounded } from '@mui/icons-material';
import Spinner from '../Spinner';
import logger from '../../utils';
import { NotificationBuilder, useNotificationDispatchContext } from '../../context/NotificationProvider';
import { RoomAuthError } from '../../api/rooms/api';
import usePassword from '../../hooks/usePassword';
import styles from './ProctectedRoom.module.css';
import useLogger from '../../hooks/useLogger';

/**
 * @param {Object} props 
 * @param {string} props.name 
 * @param {Promise<any>} props.loadRoom 
 */
function AuthenticateRoom({ name, loadRoom }) {
    // const [password, setPassword] = useState(null);
    const {value, set, hashed} = usePassword();
    
    function _onChange(e) {
        set(e.target.value);
    }

    async function submit() {
        await loadRoom(hashed());
    }

    function onKeyUp(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            submit();
        }
    }

    return (
        <div className={`col container ${styles.container}`}>
            <div className={`header marker ${styles.header}`}>
                <h1><LockRounded /> Password required</h1>
            </div>
            <h2 className={styles.roomname}>{name}</h2>
            <div className='input-container'>
                <label htmlFor="create-room-password-input" style={{marginTop: "20px"}}>Password</label>
                <p className='help'>Insert the room's password below</p>
                <input type='password' id='create-room-password-input'
                    value={value} onChange={_onChange} onKeyUp={onKeyUp}
                    style={{ fontSize: '1.5em' }} autoComplete='off'
                />
            </div>
            <div className={`buttons-group ${styles["buttons-group"]}`}>
                <button className={`btn`} onClick={submit}>Enter</button>
            </div>
        </div>
    );
}

export default function ProtectedRoom({ children }) {
    const { info, debug } = useLogger('RoomAuth');
    const { id } = useParams();
    const location = useLocation();

    const { setName } = useRoomDispatchContext();
    const { getRoom, name } = useRoomContext();
    const { pushNotification } = useNotificationDispatchContext();
    
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadRoomAsync = useCallback(async (pass = null) => {
        debug("Fetching room:", id);

        try {
            const room = await getRoom(pass);
            setAuth(false);
            info("Successfully joined room");
            return room;
        } catch (err) {
            if (err instanceof RoomAuthError) {
                const room = err.data;
                console.log(room);
    
                if (!name) {
                    setName(room.name);
                }
                
                if (room.passwordRequired) {
                    if (!auth) {
                        debug("Room", id, "needs a password - setAuth to true");
                        setAuth(true);
                    }
                } else {
                    setAuth(false);
                }
    
                if (!initialLoad) {
                    const notification = NotificationBuilder()
                        .text(room.message)
                        .build();
                    
                    pushNotification(notification);
                }
            } else {
                throw err;
            }
        } finally {
            setLoading(false);
        }
    }, [auth, getRoom, id, initialLoad, name, setName]);

    const LoadWithHash = useCallback(() => {
        if (location.state) {
            const hash = location.state.passwordHash;
            if (hash) {
                debug("Password hash found - setting up request");
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