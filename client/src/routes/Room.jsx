import logger from '../utils';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import useWebSocket from 'react-use-websocket';

import './Room.css';
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
import { useNotificationDispatchContext } from '../context/NotificationProvider';
import ResultsModal from '../components/room/Results';

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

    const { id, players, chat, music } = useGameContext();
    const { chatManager, gameManager } = useGameDispatchContext();
    
    const { add, remove } = useNotificationDispatchContext();
    const [startNotification, setStartNotification] = useState(null);

    const canvasRef = useCanvasRef();

    const [showKickBtn, setShowKickBtn] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [result, setResult] = useState(undefined);
    
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
            const winners = body.winners;
            setResult({
                first: winners[0],
                second: winners[1],
                third: winners[2]
            });
            gameManager.configurePlayback({ play: false });
            RevertTimer();
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
            // TODO: show a notification saying that lost connection?
            if (e.code === 3000) {
                add({
                    text: "You were kicked from the room",
                    hasButton: false,
                    gap: 10,
                    orient: "bottom",
                    waitForClick: false,
                });
            } else {
                if (e.reason) {
                    add({
                        text: e.reason,
                        hasButton: false,
                        gap: 10,
                        orient: "bottom",
                        waitForClick: false,
                    });
                }
            }

            navigate('/');
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
            const idx = add({
                text: "Click here to begin",
                hasButton: true,
                onButtonClick: () => {
                    sendMessage("start", { owner });
                },
                gap: 10,
                orient: "bottom",
                waitForClick: true,
                buttonText: "Start",
            });

            setStartNotification(idx);
        }
        
        return () => {
            if (startNotification !== null) {
                console.log("remove start notification:", startNotification);
                remove(startNotification);
            }
        }
    }, [owner, sendMessage, add, startNotification, remove]);

    return (
        <div id='room'>
            <Results result={result} />
            <div id='guests-container' className='col container'>
                <div className='header-container'><h2>Players</h2></div>
                <ul id='scoreboard'>
                    <Players />
                </ul>
                <OwnerButton owner={owner} showKickBtn={showKickBtn} setShowKickBtn={setShowKickBtn} />
                {/* <button className='btn btn-green' style={{ borderRadius: '0px' }} onClick={StartMatch}>Start</button> */}
            </div>
            <div className='col container game-container'>
                <div className={`timer ${timerClass}`}></div>
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