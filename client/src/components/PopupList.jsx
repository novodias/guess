import React from 'react';
import Popup from './Popup';
import './PopupList.css';
import { usePopupContext } from '../context/PopupProvider';

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
 */

/**
 * @param {Object} props
 * @param {Array<PopupProps>} props.popups
 * @param {React.Dispatch<SetStateAction<never[]>>} props.setPopups
 */
export default function PopupList() {
    const { popups } = usePopupContext();

    return (
        <div id="popup-wrapper">
            {popups.map((pop, idx) => {
                return <Popup key={idx} {...pop} batchNumber={idx + 1} hash={pop.hash} />
            })}
        </div>
    )
}