import React, { /* useEffect, */  useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../elements/TextInput';
import Collapse from '../elements/Collapse';
import { SearchRounded, RefreshRounded } from '@mui/icons-material'

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
            <div class="buttons-group">
                <button class="btn" onClick={() => join()}>Join</button>
            </div>
        </>
    )
}

function RoomsSection() {
    const roomsRef = useRef(undefined);
    
    // const [rooms, setRooms] = useState([]);
    // useEffect(() => {
    // }, [])
    
    return (
        <>
            <Collapse targetRef={roomsRef} />
            <div ref={roomsRef} id='rooms'>
                <div className='room-header'>
                    <h2>Rooms</h2>
                    <div className='search-bar row'>
                        <div className='search-wrapper'>
                            <input type='text' id='room-search' placeholder='Find' />
                            <span className='search'>
                                <SearchRounded />
                            </span>
                        </div>
                        <span className='refresh icon'>
                            <RefreshRounded />
                        </span>
                    </div>
                </div>
                <ul class="list">
                    {/* just a example */}
                    <li class="selectable">
                        <span class="name">Guest's room</span>
                        <span>
                            <b>7</b>/15
                        </span>
                    </li>
                </ul>
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