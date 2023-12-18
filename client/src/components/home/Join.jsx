// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useRef, useState, MutableRefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../elements/TextInput';
import Collapse from '../elements/Collapse';
import { SearchRounded, RefreshRounded, ArrowLeftRounded, ArrowRightRounded } from '@mui/icons-material'
import { findRoomAsync, getPublicRoomsAsync } from '../../api/rooms/api';
import useLogger from '../../hooks/useLogger';

function CodeSection() {
    let navigate = useNavigate();
    const [id, setId] = useState('');

    const join = () => navigate(`/room/${id}`);
    const onCodeInput = (value) => setId(value);
    const onEnter = () => join();

    return (
        <>
            <TextInput id="input-code" labelText='Room code' helpText="Insert the room's code below"
                    autoComplete='off' placeholder='ABC12345' value={id}
                    onInput={onCodeInput} onEnter={onEnter} />
            <div className="buttons-group">
                <button className="btn" onClick={() => join()}>Join</button>
            </div>
        </>
    )
}

/**
 * @param {Object} props 
 * @param {import('../../api/rooms/api').PublicRoom} props.room 
 */
function RoomItem({ room }) {
    let navigate = useNavigate();

    const onClick = () => {
        navigate(`/room/${room.id}`);
    }

    return (
        <li className='selectable' onClick={onClick}>
            <span className='name'>{room.name}</span>
            <span>
                <b>{room.size}</b>/15
            </span>
        </li>
    )
}

function RoomsSection() {
    const { info, debug } = useLogger("RoomsList");
    
    /**
     * @type {MutableRefObject<HTMLButtonElement>}
     */
    const refreshRef = useRef(undefined);
    const roomsRef = useRef(undefined);
    
    /**
     * @type {MutableRefObject<HTMLButtonElement>}
     */
    const rightRef = useRef(undefined);
    /**
     * @type {MutableRefObject<HTMLButtonElement>}
     */
    const leftRef = useRef(undefined);
    const [page, setPage] = useState(0);
    const [rooms, setRooms] = useState([]);
    const count = 10;

    const get = useCallback(async () => {
        info("Searching rooms available...");

        try {
            refreshRef.current.classList.add("play");

            const start = count * page;
            const data = await getPublicRoomsAsync(start, count);
            setRooms(data.rooms);

            if (page <= 0) {
                leftRef.current.disabled = true;
            } else {
                leftRef.current.disabled = false;
            }
            
            if (!data.more) {
                rightRef.current.disabled = true;
            } else {
                rightRef.current.disabled = false;
            }
        } catch (err) {
            console.error(err);
        } finally {
            // setTimeout(() => (refreshRef.current.classList.remove("play")), 1000 * 2);
            refreshRef.current.classList.remove("play")
        }
    }, [page]);
    
    useEffect(() => {
        get();
    }, [get]);

    const right = () => {
        setPage(p => {
            return ++p;
        });
    }

    const left = () => {
        setPage(p => {
            if (p <= 0) {
                return 0;
            }

            return --p;
        });
    }

    /**
     * @param {import('react').FormEvent} e
     */
    const onInput = async (e) => {
        const text = e.target.value;
        
        if (!text || text === '') {
            info("Input empty, fetching all rooms");
            get();
            return;
        }
        
        try {
            const rooms = await findRoomAsync(text);
            setRooms(rooms);
        } catch (error) {
            // console.error(rooms);
            debug(error);
        }
    }
    
    return (
        <>
            <Collapse targetRef={roomsRef} />
            <div ref={roomsRef} id='rooms'>
                <div className='room-header'>
                    <h2>Rooms</h2>
                    <div className='search-bar row'>
                        <div className='search-wrapper'>
                            <input type='text' id='room-search' placeholder='Find' onInput={onInput} />
                            <span className='search'>
                                <SearchRounded />
                            </span>
                        </div>
                        <button className='refresh btn icon' onClick={get}>
                            <RefreshRounded ref={refreshRef} className="rotating" />
                        </button>
                    </div>
                </div>
                <ul className="list">
                    {rooms.map((r, i) => <RoomItem key={i} room={r} />)}
                </ul>
                <div className="row page-selector">
                    <button className='btn icon' onClick={left} ref={leftRef}>
                        <ArrowLeftRounded />
                    </button>
                    <span><b>{page + 1}</b></span>
                    <button className='btn icon' onClick={right} ref={rightRef}>
                        <ArrowRightRounded />
                    </button>
                </div>
            </div>
        </>
    )
}

export default function Join() {
    return (
        <div className='cell join'>
            <div className='header marker m-animated'>
                <h1>Join</h1>
            </div>
            <CodeSection />
            <RoomsSection />
        </div>
    )
}