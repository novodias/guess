// import React from 'react';
import useWebSocket from 'react-use-websocket';
import { useCallback } from 'react';

const protocol = import.meta.env.DEV ? "wss://" : "ws://";
const webSocketAddress = (import.meta.env.DEV ?
    `${protocol}${window.location.hostname}:3001` :
    `${protocol}${window.location.hostname}:3000`) + `/socket`;

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
 * @param {Object} props 
 * @param {OnMessage} props.OnMessage
 * @param {OnOpen} props.OnOpen
 * @param {OnClose} props.OnClose
 * @param {OnError} props.OnError
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
        sendJsonMessage(data);
    }, [sendJsonMessage]);

    return { sendMessage };
}