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

const PopupContext = createContext(undefined);
const PopupDispatchContext = createContext(undefined);

export function PopupProvider({ children }) {
    const [popups, setPopups] = useState([]);

    /**
     * @param {PopupProps} popup
     */
    const addPopup = ({text, orient, gap, hasButton, buttonText, onButtonClick, waitForClick}) => {
        const popup = {
            text,
            orient,
            gap,
            hasButton,
            buttonText,
            onButtonClick,
            waitForClick
        }

        setPopups([...popups, popup]);
    }

    return (
        <PopupContext.Provider value={{popups}}>
            <PopupDispatchContext.Provider value={{setPopups, addPopup}}>
                {children}
            </PopupDispatchContext.Provider>
        </PopupContext.Provider>
    )
}

export const usePopupContext= () => {
    return useContext(PopupContext);
}

export const usePopupDispatchContext = () => {
    return useContext(PopupDispatchContext);
}