import React from 'react';
import Popup from './Popup';
import './PopupList.css';
import { usePopupContext } from '../context/PopupProvider';

export default function PopupList() {
    const { popups } = usePopupContext();

    return (
        <div id="popup-wrapper">
            {popups.map((pop, idx) => {
                return <Popup key={pop.uid} {...pop} batchNumber={idx + 1} />
            })}
        </div>
    )
}