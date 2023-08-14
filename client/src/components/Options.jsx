import React, { useContext, useEffect, useState, useRef } from 'react';
import './Options.css';
import { SettingsContext, SettingsDispatchContext } from '../context/SettingsProvider';

export default function SettingsBubble({ hide }) {
    const { username } = useContext(SettingsContext);
    const setSettingsDetails = useContext(SettingsDispatchContext);
    const [display, setDisplay] = useState('none');
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (hide) {
            timerRef.current = setTimeout(() => {
                setDisplay("none");
            }, 1000);
        } else {
            setDisplay("flex");
        }
    }, [hide]);

    const setUsername = (e) => {
        setSettingsDetails({
            username: e.target.value
        });
    }

    return (
        <div className={`bubble col ${hide ? 'hide' : 'spawn'}`} style={{ display: display }}>
            <div className='bubble-title'>
                <h1>Settings</h1>
            </div>
            <div>
                <label htmlFor='options-nickname-input'>Name</label>
                <input type="text" id='options-nickname-input' placeholder='Guest'
                    value={username} onInput={setUsername} />
            </div>
            <div className='bubble-space'></div>
            <div className='bubble-end'>
                <h3>The settings will be updated after closing.</h3>
            </div>
        </div>
    );
}