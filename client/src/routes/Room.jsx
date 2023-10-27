import logger from '../utils';
import React, { useEffect, useState, useContext } from 'react';
// import useWebSocket from 'react-use-websocket';

import './Room.css';
import { SettingsContext } from '../context/SettingsProvider';
import { Chat, CopyLink, Difficulty, Guest, OwnerButton } from '../components/room/Export';
import { LogoutRounded } from '@mui/icons-material';
import { useRoomContext } from '../context/RoomProvider';
import { error } from '../api/export';
import InputTitles from '../components/InputTitles';
import useGameWebSocket from '../components/room/game/Websocket';
import { useGameContext, useGameDispatchContext } from '../context/GameProvider';
import AudioPlayer from '../components/room/AudioPlayer';
import useCanvasRef from '../components/room/game/Canvas';
import { getMusic } from '../api/client';

function Crown() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        style={{filter: "drop-shadow(gray -1px -1px 0px)"}}>
            <path fill="currentColor" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z" />
        </svg>
    );
}

function updateGuest(player, stat) {
    if (player.id === stat.id) {
        player.points = stat.points;
        player.status = stat.status;
        return player;
    } else {
        return player;
    }
}

function RoomPage() {
    const { username, showAudioVisualizer } = useContext(SettingsContext);
    const { owner, roomId } = useRoomContext();

    const { id, players, chat, music } = useGameContext();
    const { chatManager, gameManager } = useGameDispatchContext();

    const canvasRef = useCanvasRef();

    const [showKickBtn, setShowKickBtn] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    
    const [timerClass, setTimerClass] = useState('');
    const StartTimer = () => setTimerClass("timer-start");
    const RevertTimer = () => setTimerClass("timer-start timer-goback");

    const messageHandler = {
        "players": (body) => {
            const newPĺayers = body;
            gameManager.setPlayers(newPĺayers);
        },
        "exited": (body) => {
            const exit = body;
            const player = players.find(g => g.id === exit.id);
            let systemMessage;
            if (!exit.kicked) {
                systemMessage = {
                    text: `${player.nickname} exited the game.`,
                    nickname: "System",
                }
            } else {
                systemMessage = {
                    text: `${player.nickname} was kicked from the game.`,
                    nickname: "System",
                }
            }
            chatManager.alert(systemMessage);
            gameManager.removePlayer(exit.id);
        },
        "yourid": (body) => {
            const { id } = body;
            gameManager.setClientId(id);
        },
        "chat": (body) => {
            chatManager.add(body);
        },
        "change": (body) => {
            gameManager.updatePlayers((plys) => plys.map(ply => updateGuest(ply, body)));
        },
        "prepare": (body) => {
            const { music_hash, start_at } = body;
            const play = false;
            const src = getMusic(roomId, music_hash);
            
            gameManager.configurePlayback({
                src: src,
                start_at: start_at,
                play: play
            });

            RevertTimer();
        },
        "round": (body) => {
            const { players } = body;
            StartTimer();
            setReadOnly(false);
            gameManager.setPlayers(players);
            gameManager.configurePlayback({ play: true });
        },
        "end": (body) => {
            gameManager.configurePlayback({ play: false });
            RevertTimer();
        }
    };

    const { sendMessage } = useGameWebSocket({
        onMessage: (e) => {
            const message = JSON.parse(e.data);
            const { type, body } = message;
            logger.debug("Message received: ", body);
            messageHandler[type](body);
        },
        onOpen: () => {
            console.log("Connected");
        },
        onClose: (e) => {
            console.log("Close:", e.reason);
            // TODO: show a popup saying that lost connection?
        },
        onError: (e) => {
            if (process.env.NODE_ENV === 'development') {
                e.id = id;
                e.nickname = username;
                e.date = new Date();
                error(e);
            }
        }
    });

    const KickPerson = (personId) => {
        if (id === personId) {
            return;
        }

        sendMessage("kick", { owner, id: personId });
    }

    const SendChatMessage = (text) => {
        sendMessage("chat", { text, nickname: username });
    }

    const SubmitAnswer = (title) => {
        sendMessage("submit", { id, title: { id: title.id } });
        setReadOnly(true);
    }

    const StartMatch = () => {
        sendMessage("start", { owner });
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
                    players
                        .sort((v1, v2) => v2.points - v1.points)
                        .map((v, i) => <GuestContainer key={i} v={v} inFirstPlace={i === 0} />)
                }
            </ul>
        )
    }

    function GameCanvas() {
        if (!showAudioVisualizer) {
            return null;
        }

        return <canvas id='game-canvas' ref={canvasRef} width={500} height={500}></canvas>
    }

    useEffect(() => {
        window.history.replaceState(null, "Room", "/room");
    }, []);

    useEffect(() => {
        // this prevents sending joined to websocket again
        if (id === null) {
            sendMessage("joined", {
                nickname: username,
                room_id: roomId
            });
        }
    }, [sendMessage, roomId, id, username]);

    return (
        <div id='room'>
            <div id='guests-container' className='col container'>
                <div className='header-container'><h2>Players</h2></div>
                <Scoreboard />
                <OwnerButton owner={owner} showKickBtn={showKickBtn} setShowKickBtn={setShowKickBtn} />
                <button className='btn btn-green' style={{ borderRadius: '0px' }} onClick={StartMatch}>Start</button>
            </div>
            <div className='col container game-container'>
                <div className={`timer ${timerClass}`}></div>
                <Difficulty value={'???'} />
                <InputTitles readOnly={readOnly} onDropdownClick={SubmitAnswer} />
                <GameCanvas />
                <AudioPlayer src={music.src}
                    play={music.play}
                    playButtonDisabled={true}
                    startTime={music.start_at}
                    canvasCallback={canvasRef.invoke} />
            </div>
            <div className='right-wrapper col'>
                <CopyLink id={roomId} />
                <div className='col container chat-container'>
                    <div className='header-container'><h2>Chat</h2></div>
                    <Chat messages={chat} onEnter={SendChatMessage} />
                </div>
            </div>
        </div>
    );
}

export default RoomPage;