import React, { useState, createContext, useContext } from 'react';

/**
 * @typedef PopupProps
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
 * @callback AddPopup
 * @param {PopupProps} popup
 */

const PopupContext = createContext(undefined);
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
    const add = ({text, orient, gap, hasButton, buttonText, onButtonClick, waitForClick}) => {
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

        const idx = popups.length;
        setPopups([...popups, popup]);
        return idx;
    }

    const remove = (idx) => {
        setPopups(pops => pops.filter((v, i) => i !== idx));
    }

    return (
        <PopupContext.Provider value={{popups}}>
            <PopupDispatchContext.Provider value={{remove, add}}>
                {children}
            </PopupDispatchContext.Provider>
        </PopupContext.Provider>
    )
}

export const usePopupContext= () => {
    return useContext(PopupContext);
}

/**
 * @returns {PopupDispatch}
 */
export const usePopupDispatchContext = () => {
    return useContext(PopupDispatchContext);
}