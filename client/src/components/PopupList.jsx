import React from 'react';
import Popup from './Popup';
import { usePopupContext, usePopupDispatchContext } from '../context/PopupProvider';

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
    // const [popups, setPopups] = useState([]);
    const { popups } = usePopupContext();
    const { setPopups } = usePopupDispatchContext();
    
    const onDone = (idx) => {
        setPopups(array => array.filter((v, key) => key !== idx));
    }

    return (
        <div id="popup-wrapper">
            {popups.map((pop, idx) => {
                return <Popup {...pop} batchNumber={idx + 1}
                    onDone={() => onDone(idx)} />
            })}
        </div>
    )
}