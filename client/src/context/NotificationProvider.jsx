import React, { useState, createContext, useContext, useCallback } from 'react';

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
    const add = useCallback(({ text, orient, gap,
        hasButton, buttonText,
        onButtonClick, waitForClick }) => {
        const notification = {
            uid: crypto.randomUUID(),
            text,
            orient,
            gap,
            hasButton,
            buttonText,
            onButtonClick,
            waitForClick,
            close: false
        }

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
            <NotificationDispatchContext.Provider value={{remove, add}}>
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