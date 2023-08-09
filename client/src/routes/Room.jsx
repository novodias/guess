import './Room.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Chat, CopyLink, Difficulty, Guest, OwnerButton } from '../components/room/Export';
import InputTitles from '../components/InputTitles';
import { LogoutRounded } from '@mui/icons-material';
import YoutubePlayer from '../components/YoutubePlayer';
// import { Status } from '../components/room/Guest';

function Crown() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z" />
        </svg>
    );
}

const webSocketAddress = (process.env.NODE_ENV === 'development' ?
    `ws://${window.location.hostname}:3001` :
    `ws://${window.location.hostname}:3000`) + `/socket`;

function RoomPage() {
    const room = useLoaderData();
    let navigate = useNavigate();

    let nickname = sessionStorage.getItem("nickname");
    nickname = nickname === null ? "Guest" : nickname;

    const [id, setId] = useState(null);
    const [owner, setOwner] = useState('');
    const [guests, setGuests] = useState([]);
    const [chat, setChat] = useState([]);
    const [showKickBtn, setShowKickBtn] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [video, setVideo] = useState({});
    
    const [timerClass, setTimerClass] = useState('');
    const StartTimer = () => setTimerClass("timer-start");
    const RevertTimer = () => setTimerClass("timer-start timer-goback");

    const { sendJsonMessage } = useWebSocket(webSocketAddress, {
        onOpen: () => {
            console.log('connected');
        },
        onMessage: (e) => {
            const message = JSON.parse(e.data);
            // console.log(message);
            
            const body = message.body;
            if (message.type === "players") {
                const players = body;
                setGuests(players);
            }

            if (message.type === "exited") {
                const { id } = body;
                const player = guests.find(g => g.id === id);
                setChat([...chat, {
                    text: `${player.nickname} was kicked from the game.`, 
                    nickname: "System",
                    isSystem: true
                }]);

                setGuests(array => array.filter(g => g.id !== id));
            }

            if (message.type === "yourid") {
                const { id } = body;
                setId(id);
            }

            if (message.type === "chat") {
                setChat([...chat, body]);
            }

            if (message.type === "change") {
                const { playerId, points, status } = body;
                const updateGuests = guests.map(g => {
                    if (g.id === playerId) {
                        g.points = points;
                        g.status = status;
                        return g;
                    } else {
                        return g;
                    }
                })
                
                setGuests(updateGuests);
            }

            if (message.type === "prepare") {
                const { /* room_status, round, */ youtube_id, start_at } = body;
                
                RevertTimer();
                setVideo({
                    youtube_id,
                    start_at,
                    play: false,
                });
            }

            if (message.type === "round") {
                const { /* room_status, */ players } = body;
                
                StartTimer();
                setReadOnly(false);
                setGuests(players);
                video.play = true;
            }

            if (message.type === "end") {
                video.play = false;
                RevertTimer();
            }

        },
        onClose: (e) => {
            if (e.code === 3000) {
                console.log(e.reason);
            }

            console.log("close");
            
            // show a popup saying that lost connection?
        },
        onError: (e) => {
            if (process.env.NODE_ENV === 'development') {
                e.id = id
                e.nickname = nickname;
                e.date = new Date();
                axios.post('api/error', e);
            }
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

    const SendChatMessage = (text) => {
        sendJsonMessage({ type: "chat", body: { text, nickname } });
    }

    const SubmitAnswer = (title) => {
        sendJsonMessage({ type: "submit", body: { id, title } });
        setReadOnly(true);
    }

    const StartMatch = () => {
        sendJsonMessage({ type: "start", body: { owner } });
    }

    function GuestContainer({v, inFirstPlace}) {
        const btn_kick = showKickBtn && owner;
        return (
            <li className='row'>
                {owner && id !== v.id && <div className='btn-kick' style={{ display: btn_kick ? 'block' : 'none' }}>
                    <button onClick={() => KickPerson(v.id)}>
                        <LogoutRounded htmlColor='white' />
                    </button>
                </div>}
                <div className='crown'>
                    {inFirstPlace ? <Crown /> : null}
                </div>
                <Guest {...v} />
            </li>
        )
    }

    function Scoreboard() {
        return (
            <ul id='scoreboard'>
                {
                    guests
                        .sort((v1, v2) => v2.points - v1.points)
                        .map((v, i) => <GuestContainer key={i} v={v} inFirstPlace={i === 0} />)
                }
            </ul>
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
                <Scoreboard />
                <OwnerButton owner={owner} showKickBtn={showKickBtn} setShowKickBtn={setShowKickBtn} />
                <button className='btn btn-green' style={{ borderRadius: '0px' }} onClick={StartMatch}>Start</button>
            </div>
            <div className='room-container col'>
                <div className={`timer ${timerClass}`}></div>
                <Difficulty value={'???'} />
                <InputTitles readOnly={readOnly} onDropdownClick={SubmitAnswer} />
                <YoutubePlayer videoId={video.youtube_id} startAt={video.start_at} play={video.play} />
            </div>
            <div className='col container chat-container'>
                <CopyLink id={room.id} />
                <Chat messages={chat} onEnter={SendChatMessage} />
            </div>
        </>
    );
}

export async function RoomLoader({ params }) {
    let passwordHash = sessionStorage.getItem("RoomPasswordHash");
    passwordHash && sessionStorage.removeItem("RoomPasswordHash");

    const res = await fetch(`/api/rooms/${params.id}${passwordHash !== null ? `?hash=${passwordHash}` : ''}`);

    if (!res.ok) {
        // Wrong password
        if (res.status === 400) {    
            return await res.json();
        }
        
        if (res.status === 404) {
            throw new Response("Not Found", { status: 404 });
        }
        
        throw new Error(res.status);
    }
    
    return await res.json();
}

export default RoomPage;