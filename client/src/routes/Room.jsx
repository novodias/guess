import logger from '../utils';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import useWebSocket from 'react-use-websocket';

// import './Room.css';
import '../styles/pages/room.css'
import { SettingsContext } from '../context/SettingsProvider';
import { Chat, CopyLink, Difficulty, GuestContainer, OwnerButton } from '../components/room/Export';
import { useRoomContext } from '../context/RoomProvider';
import { error } from '../api/export';
import InputTitles from '../components/InputTitles';
import useGameWebSocket from '../components/room/game/Websocket';
import { useGameContext, useGameDispatchContext } from '../context/GameProvider';
import AudioPlayer from '../components/room/AudioPlayer';
import useCanvasRef from '../components/room/game/Canvas';
import { getMusic } from '../api/client';
import { NotificationBuilder, useNotificationDispatchContext } from '../context/NotificationProvider';
import ResultsModal from '../components/room/Results';
import Timer from '../components/room/game/Timer';

function updateGuest(player, stat) {
    if (player.id === stat.id) {
        player.points = stat.points;
        player.status = stat.status;
        return player;
    } else {
        return player;
    }
}

function Results({result}) {
    if (result === undefined) {
        return null;
    }

    return <ResultsModal {...result} />
}

function RoomPage() {
    let navigate = useNavigate();
    const { username, showAudioVisualizer, avatar } = useContext(SettingsContext);
    const { owner, roomId } = useRoomContext();

    const { id, players, chat, music, timer } = useGameContext();
    const { chatManager, gameManager } = useGameDispatchContext();
    
    const { add, pushNotification, remove } = useNotificationDispatchContext();
    const [startNotification, setStartNotification] = useState(null);

    const canvasRef = useCanvasRef();

    const [showKickBtn, setShowKickBtn] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [result, setResult] = useState(undefined);

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
        "timer": (body) => {
            gameManager.configureTimer(body);
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

            gameManager.revertTimer();
            // RevertTimer();
        },
        "round": (body) => {
            const { players } = body;
            // StartTimer();
            gameManager.startTimer();
            setReadOnly(false);
            gameManager.setPlayers(players);
            gameManager.configurePlayback({ play: true });
        },
        "end": (body) => {
            const winners = body.winners;
            setResult({
                first: winners[0],
                second: winners[1],
                third: winners[2]
            });
            gameManager.configurePlayback({ play: false });
            gameManager.revertTimer();
            // RevertTimer();
        }
    };

    const { sendMessage } = useGameWebSocket({
        onMessage: (e) => {
            const message = JSON.parse(e.data);
            const { type, body } = message;
            logger.debug("Message received [" + type + "]:", body);
            messageHandler[type](body);
        },
        onOpen: () => {
            if (id === null) {
                sendMessage("joined", {
                    nickname: username,
                    room_id: roomId,
                    avatar: avatar
                });
            }
            console.log("Connected");
        },
        /**
         * @param {CloseEvent} e
         */
        onClose: (e) => {
            console.log("Close:", e.reason);
            
            const builder = NotificationBuilder()
                .clickable();
            
            let notification;

            if (e.code === 3000) {
                notification = builder.text("You were kicked from the room").build();
            } else {
                if (e.reason) {
                    notification = builder.text(e.reason).build();
                }
            }
            
            if (notification) pushNotification(notification);

            // navigate('/');
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

    const KickPerson = useCallback((personId) => {
        if (id === personId) {
            return;
        }

        sendMessage("kick", { owner, id: personId });
    }, [id, owner, sendMessage]);

    const SendChatMessage = (text) => {
        sendMessage("chat", { text, nickname: username });
    }

    const SubmitAnswer = (title) => {
        sendMessage("submit", { id, title: { id: title.id } });
        setReadOnly(true);
    }

    const Players = useCallback(() => {
        return players
            .sort((v1, v2) => v2.points - v1.points)
            .map((v, i) => <GuestContainer key={i}
                guest={v}
                owner={owner}
                clientId={id}
                inFirstPlace={i === 0}
                kickEnabled={showKickBtn}
                KickPerson={KickPerson}
            />)
    }, [id, owner, players, showKickBtn, KickPerson]);

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
        if (startNotification === null && owner) {
            const notification = NotificationBuilder()
                .text("Click here to begin")
                .button("Start", () => sendMessage("start", { owner }))
                .build();
            
            const idx = pushNotification(notification);

            setStartNotification(idx);
        }
        
        return () => {
            if (startNotification !== null) {
                remove(startNotification);
            }
        }
    }, [owner, sendMessage, startNotification, remove]);

    return (
        <div id='room'>
            <Results result={result} />
            <div className='col container game-container'>
                <Timer {...timer} />
                <Difficulty value={'???'} />
                <GameCanvas />
                <AudioPlayer src={music.src}
                    play={music.play}
                    playButtonDisabled={true}
                    startTime={music.start_at}
                    canvasCallback={canvasRef.invoke}
                    showAudioVisualizer={showAudioVisualizer} />
                <InputTitles readOnly={readOnly} onDropdownClick={SubmitAnswer} />
            </div>
            <div id='guests-container' className='col container'>
                <div className='header-container'><h2>Players</h2></div>
                <ul id='scoreboard' className='col'>
                    <Players />
                </ul>
                {/* <OwnerButton owner={owner} showKickBtn={showKickBtn} setShowKickBtn={setShowKickBtn} /> */}
            </div>
            <div className='right-wrapper col'>
                <CopyLink id={roomId} />
                <div className='col container chat-container'>
                    {/* <div className='header-container'><h2>Chat</h2></div> */}
                    <Chat messages={chat} onEnter={SendChatMessage} />
                </div>
            </div>
        </div>
    );
}

export default RoomPage;