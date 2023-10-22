import React, { createContext, useContext, useEffect, useState } from 'react';
import logger from '../utils';
// import logger from '../utils';

const GameContext = createContext(undefined);

/**
 * @type {GameDispatch}
 */
const GameDispatchContext = createContext(undefined);

/**
 * @typedef {Object} ChatManager
 * @property {void} add Add chat message
 * @property {void} alert Add system message
 */

/**
 * @callback SetClientId
 * @param {Number} clientId
 * 
 * @callback ConfigurePlayback
 * @param {{src, play, start_at}} video_object
 * 
 * @callback SetPlayers
 * @param {Array} players
 * 
 * @callback RemovePlayer
 * @param {Number} id
 * 
 * @callback UpdatePlayers
 * @param {UpdatePlayersCallback} callback
 * 
 * @callback UpdatePlayersCallback
 * @param {Array} players
 * @returns {Array}
 */

/**
 * @typedef {Object} GameManager
 * @property {SetClientId} setClientId 
 * @property {ConfigurePlayback} configurePlayback
 * @property {SetPlayers} setPlayers
 * @property {RemovePlayer} removePlayer
 * @property {UpdatePlayers} updatePlayers
 */

/**
 * @typedef {Object} GameDispatch
 * @property {ChatManager} chatManager
 * @property {GameManager} gameManager
 */

export function GameProvider({ children }) {
    const [id, setId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [chat, setChat] = useState([]);
    const [music, setMusic] = useState({});

    const chatManager = {
        add: (message) => {
            setChat(chat => [...chat, message]);
        },
        alert: (message) => {
            message.isSystem = true;
            chatManager.add(message);
        }
    };

    const gameManager = {
        setClientId: (clientId) => {
            if (id === null) {
                setId(clientId);
            }
        },
        configurePlayback: (config) => {
            setMusic({
                ...music,
                ...config
            });
        },
        // add: (player) => {
        //     setPlayers(array => [...array, player]);
        // },
        setPlayers: (players) => {
            setPlayers(players);
        },
        removePlayer: (id) => {
            setPlayers(array => array.filter(g => g.id !== id));
        },
        updatePlayers: (callback) => {
            const updated = callback(players);

            if (updated instanceof Array) {
                gameManager.setPlayers(updated);
            }
        }
    };

    useEffect(() => {
        logger.debug('effect game music context ->', music);
    });

    return (
        <GameContext.Provider value={{ id, players, chat, music }}>
            <GameDispatchContext.Provider value={{ chatManager, gameManager }}>
                {children}
            </GameDispatchContext.Provider>
        </GameContext.Provider>
    );
}

/**
 * 
 * @returns {{id, players, chat, video}}
 */
export const useGameContext= () => {
    return useContext(GameContext);
}

/**
 * 
 * @returns {GameDispatch}
 */
export const useGameDispatchContext = () => {
    return useContext(GameDispatchContext);
}