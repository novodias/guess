import React, { useState, createContext, useContext, useCallback } from 'react';
import { nanoid } from 'nanoid'

/**
 * @typedef {Object} NotificationObject
 * @property {string} uid
 * @property {("bottom"|"top")} orient
 * @property {number} gap
 * @property {boolean} clickable
 * @property {function(MouseEvent)|null} action 
 * @property {{string}|null} button 
 */

export function NotificationBuilder() {
    /**
     * @type {NotificationObject}
     */
    const notification = {
        uid: nanoid(),
        orient: "bottom",
        gap: 10,
        clickable: false,
        action: null,
        button: null
    };

    const builder = {
        text: (text) => {
            notification.text = text
            return builder;
        },
        clickable: (callback) => {
            notification.clickable = true;
            if (callback) {
                notification.action = callback;
            }
            return builder;
        },
        button: (text, callback) => {
            notification.button = { text };
            notification.clickable = true;
            if (callback) {
                notification.action = callback;
            }
            return builder;
        },
        build: () => {
            return notification;
        }
    }
    
    return builder; 
}

/**
 * @typedef NotificationProps
 * @property {string} uid
 * @property {string} text
 * @property {("bottom"|"top")} orient 
 * @property {number} gap 
 * @property {number|Null} batchNumber 
 * @property {boolean} hasButton 
 * @property {string} buttonText 
 * @property {function(PointerEvent)} onButtonClick 
 * @property {function} onDone 
 * @property {boolean} waitForClick 
 */

/**
 * @typedef {Object} NotificationProvider
 * @property {Array<NotificationProps>} notifications
 */

/**
 * @type {NotificationProvider}
 */
const NotificationContext = createContext(undefined);

/**
 * @callback AddNotification
 * @param {NotificationProps} props
 */
/**
 * @typedef {Object} NotificationDispatch
 * @property {AddNotification} add
 * @property {React.Dispatch<React.SetStateAction<NotificationProps[]>>} setNotifications
 * @property {function(NotificationObject)} pushNotification
 */

/**
 * @type {NotificationDispatch}
 */
const NotificationDispatchContext = createContext(undefined);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    /**
     * @param {NotificationProps} props
     */
    const add = useCallback(({ text, orient, hasButton, buttonText, onButtonClick, waitForClick }) => {
        const notification = {
            uid: nanoid(),
            text,
            orient,
            gap: 10,
            action: onButtonClick,
            clickable: waitForClick,
        }

        notification.button = hasButton !== null ? { text: buttonText } : null;

        setNotifications(p => [...p, notification]);
        return notification.uid;
    }, []);

    const pushNotification = useCallback(notification => {
        setNotifications(p => [...p, notification]);
        return notification.uid;
    }, []);

    const remove = useCallback((uid) => {
        setNotifications(pops => {
            const idx = pops.findIndex((p => p.uid === uid));
            return pops.filter((v, i) => i !== idx);
        });
    }, []);

    return (
        <NotificationContext.Provider value={{notifications}}>
            <NotificationDispatchContext.Provider value={{remove, add, pushNotification}}>
                {children}
            </NotificationDispatchContext.Provider>
        </NotificationContext.Provider>
    )
}

/**
 * @returns {NotificationProvider}
 */
export const useNotificationContext= () => {
    return useContext(NotificationContext);
}

/**
 * @returns {NotificationDispatch}
 */
export const useNotificationDispatchContext = () => {
    return useContext(NotificationDispatchContext);
}