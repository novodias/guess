import './Room.css';
import React, { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import Guest from '../components/room/Guest';
import { useLoaderData, useNavigate } from 'react-router-dom';
import BubbleCopyLink from '../components/room/CopyLink';
import InputTitles from '../components/InputTitles';
import { LogoutRounded, MessageRounded } from '@mui/icons-material';
// import YoutubePlayer from '../components/YoutubePlayer';
// import { Status } from '../components/room/Guest';

function crown() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z" />
        </svg>
    );
}

function RoomPage() {
    const room = useLoaderData();
    let navigate = useNavigate();

    // this can cause a crash on the server.
    let nickname = sessionStorage.getItem("nickname");
    nickname = nickname === null ? "Guest" : nickname;

    const [id, setId] = useState(null);
    const [owner, setOwner] = useState('');
    const [guests, setGuests] = useState([]);
    const [chat, setChat] = useState([]);
    const [text, setText] = useState('');
    const [showKickBtn, setShowKickBtn] = useState(false);
    
    // const [roomId, setRoomId] = useState(room.id);
    // const [videoId, setVideoId] = useState('');

    const { sendJsonMessage } = useWebSocket(process.env.REACT_APP_WS, {
        onOpen: () => {
            console.log('connected');
        },
        onMessage: (e) => {
            const message = JSON.parse(e.data);
            console.log(message);

            if (message.type === "players") {
                const players = message.body;
                setGuests(players);
            }

            if (message.type === "exited") {
                const { id } = message.body;
                // const newGuests = guests.filter(g => g.id !== id);
                setGuests(array => array.filter(g => g.id !== id));
            }

            if (message.type === "yourid") {
                const { id } = message.body;
                setId(id);
            }

            if (message.type === "chat") {
                const newChat = chat;
                newChat.push(message.body);
                setChat(newChat);
            }
        },
        onClose: (e) => {
            if (e.code === 3000) {
                console.log(e.reason);
            }

            console.log("close");
        },
        shouldReconnect: () => false,
        share: true,
    }, true);

    const KickPerson = (personId) => {
        if (id === personId) {
            return;
        }

        sendJsonMessage({ type: "kick", body: { owner, id: personId }});
    }

    const SendChatMessage = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (!text || text === '' || text.startsWith('\n')) {
                setText('');
                return;
            } else {
                sendJsonMessage({ type: "chat", body: { text, nickname }})
                setText('');
            }
        }
    }

    // todo: implement kick button client/server
    function guest(v, i) {
        const btn_kick = showKickBtn && owner;
        return (
            <li key={i} className='row'>
                {owner && id !== v.id && <div className='btn-kick' style={{ display: btn_kick ? 'block' : 'none' }}>
                    <button onClick={() => KickPerson(v.id)}>
                        <LogoutRounded htmlColor='white' />
                    </button>
                </div>}
                <div className='crown'>
                    {i === 0 ? crown() : null}
                </div>
                <Guest {...v} />
            </li>
        )
    }

    const ownerBtn = () => {
        if (!owner) {
            return null;
        }

        return (
            <div className='row'>
                <input type='checkbox' defaultChecked={false} id='checkbox-show-kick-btn' value={showKickBtn}
                    onChange={(e) => setShowKickBtn(e.target.checked)}/>
                <label htmlFor='checkbox-show-kick-btn'>Show kick button</label>
            </div>
        )
    }

    useEffect(() => {
        const ownerId = sessionStorage.getItem("RoomOwnerId");
        
        ownerId && setOwner(ownerId);
        ownerId && sessionStorage.removeItem("RoomOwnerId");

        if (room.requirePassword) {
            navigate(`/enter/${room.id}`, { state: room });
        } else {
            window.history.replaceState(null, "Room", "/room");

            // this prevents sending joined to websocket again
            if (id === null) {
                sendJsonMessage({ type: "joined", body: { nickname, room_id: room.id } });
            }
        }
    }, [navigate, sendJsonMessage, room, id, nickname]);

    return (
        <>
            <div id='guests-container' className='col'>
                <ul>
                    {guests.map((v, i) => guest(v, i))}
                </ul>
                {ownerBtn()}
            </div>
            <div className='room-container col'>
                <div className='timer'></div>
                <div className='difficulty-container row'>
                    <h2>DIFFICULTY</h2><span>???</span>
                </div>
                <InputTitles onDropdownClick={(title) => console.log(title)} />
                {/* <input id='room-input-guess' type="text" placeholder='Video ID...'
                    value={this.state.videoIdInput} onInput={this._onInput} onKeyUp={this._onKeyUp} /> */}
                {/* <YoutubePlayer videoId={this.state.videoId} /> */}
            </div>
            <div className='col container chat-container'>
                <BubbleCopyLink id={room.id} />
                <div id='chat' className='col'>
                    <ul className='remove-ul-li-style'>
                        {
                            chat.map((message, key) => {
                                return <li key={key}>
                                    <div className='chat-message'>
                                        <span><h2>{message.nickname}</h2> {message.text}</span>
                                    </div>
                                </li>
                            })
                        }
                    </ul>
                    <div id='anchor'></div>
                </div>
                <div className='chat-textbox-container'>
                    <textarea autoComplete='false' maxLength={200} value={text}
                        onInput={(e) => setText(e.target.value)}
                        onKeyUp={SendChatMessage}></textarea>
                    <span><MessageRounded /></span>
                </div>
            </div>
        </>
    );
}

export async function RoomLoader({ params }) {
    let passwordHash = sessionStorage.getItem("RoomPasswordHash");
    passwordHash && sessionStorage.removeItem("RoomPasswordHash");

    const res = await fetch(`${process.env.REACT_APP_API}/room/${params.id}${passwordHash !== null ? `?hash=${passwordHash}` : ''}`);

    if (!res.ok) {
        if (res.status !== 400) {
            throw new Error(res.status);
        }

        return await res.json();
    }
    
    if (res.status === 404) {
        throw new Response("Not Found", { status: 404 });
    }
    
    return await res.json();
}

export default RoomPage;