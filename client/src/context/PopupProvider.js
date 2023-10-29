import React, { useState, createContext, useContext, useCallback } from 'react';

/**
 * @typedef PopupProps
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
 * @typedef {Object} PopupProvider
 * @property {Array<PopupProps>} popups
 */

/**
 * @type {PopupProvider}
 */
const PopupContext = createContext(undefined);

/**
 * @callback AddPopup
 * @param {PopupProps} popup
 */
/**
 * @typedef {Object} PopupDispatch
 * @property {AddPopup} add
 * @property {React.Dispatch<React.SetStateAction<PopupProps[]>>} setPopups
 */

/**
 * @type {PopupDispatch}
 */
const PopupDispatchContext = createContext(undefined);

export function PopupProvider({ children }) {
    const [popups, setPopups] = useState([]);

    /**
     * @param {PopupProps} popup
     */
    const add = useCallback(({ text, orient, gap,
        hasButton, buttonText,
        onButtonClick, waitForClick }) => {
        const popup = {
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

        setPopups(p => [...p, popup]);
        return popup.uid;
    }, []);

    const remove = useCallback((uid) => {
        // console.log("removing popup uid:", uid);
        // setPopups(pops => pops.filter((v, i) => v.uid !== uid));
        setPopups(pops => {
            const idx = pops.findIndex((p => p.uid === uid));
            return pops.filter((v, i) => i !== idx);
        });
    }, []);

    return (
        <PopupContext.Provider value={{popups}}>
            <PopupDispatchContext.Provider value={{remove, add}}>
                {children}
            </PopupDispatchContext.Provider>
        </PopupContext.Provider>
    )
}

/**
 * @returns {PopupProvider}
 */
export const usePopupContext= () => {
    return useContext(PopupContext);
}

/**
 * @returns {PopupDispatch}
 */
export const usePopupDispatchContext = () => {
    return useContext(PopupDispatchContext);
}