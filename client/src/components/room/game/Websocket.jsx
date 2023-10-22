// import React from 'react';
import useWebSocket from 'react-use-websocket';
// import logger from '../../../utils';
import { useCallback } from 'react';

const webSocketAddress = (process.env.NODE_ENV === 'development' ?
    `wss://${window.location.hostname}:3001` :
    `wss://${window.location.hostname}:3000`) + `/socket`;

/**
 * @callback OnMessage
 * @param {MessageEvent} event
 * 
 * @callback OnOpen
 * 
 * @callback OnClose
 * @param {CloseEvent} event
 * 
 * @callback OnError
 * @param {Event} errorEvent
 * 
 * @callback sendMessage
 * @param {string} type
 * @param {any} body
 */

/**
 * 
 * @param {{OnMessage, OnOpen, OnClose, OnError}} props 
 * @returns {sendMessage}
 */
export default function useGameWebSocket({ onMessage, onOpen, onClose, onError }) {    
    const { sendJsonMessage } = useWebSocket(webSocketAddress, {
        onOpen,
        onMessage,
        onClose,
        onError,
        shouldReconnect: () => false,
        share: true,
    }, true);

    function prepareMessage(type, body) {
        return { type, body };
    }

    const sendMessage = useCallback((type, body) => {
        const data = prepareMessage(type, body);
        // logger.debug('Sending: ', data);
        sendJsonMessage(data);
    }, [sendJsonMessage]);

    return { sendMessage };
}