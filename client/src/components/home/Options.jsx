import React, { useRef, useState } from 'react';
import { getTotalAvatars, useSettingsContext, useSettingsDispatchContext } from '../../context/SettingsProvider';
import Checkbox from '../elements/Checkbox';
import TextInput from '../elements/TextInput';
import { Settings } from '@mui/icons-material';

function AvatarContainer() {
    const { avatar } = useSettingsContext();
    const setSettings = useSettingsDispatchContext();

    const [showAvatars, setShowAvatars] = useState(false);

    const setAvatar = (num) => {
        setSettings(stg => {
            return {
                ...stg,
                avatar: num
            }
        });
    }

    const total = getTotalAvatars();

    function Avatar(num) {
        const url = `cdn/avatars/${num}`;

        return (
            <span className='avatar-selectable darken'
                onClick={() => setAvatar(num)}>
                <img src={url} alt={'Avatar ' + num}></img>
            </span>
        )
    }

    const SelectableAvatars = () => {
        const avatars = [];
        for (let i = 1; i < total; i++) {
            avatars.push(Avatar(i));
        }
        return avatars;
    }

    const AvatarsContainer = () => {
        // this gets the images everytime
        // if (!showAvatars) {
        //     return null;
        // }

        const style = {
            display: showAvatars ? 'flex' : 'none'
        };

        return (
            <div className='row avatars-selectable-container container' style={style}>
                <SelectableAvatars />
            </div>
        )
    }

    return (
        <div data-text="Your avatar" className='avatars-container tooltip' onClick={() => setShowAvatars(v => !v)}>
            <img className='your-avatar' src={`cdn/avatars/${avatar}`} alt='Your avatar'></img>
            <AvatarsContainer />
        </div>
    )
}

function SettingsContainer() {
    const { username, showAudioVisualizer } = useSettingsContext();
    const setSettings = useSettingsDispatchContext();
    /**
     * @type {import('react').MutableRefObject<HTMLElement>}
     */
    const settingsRef = useRef(null);

    const setUsername = (text) => {
        setSettings(stg => {
            return {
                ...stg,
                username: text
            }
        });
    }

    const setAudioVisualizer = (checked) => {
        setSettings(stg => {
            return {
                ...stg,
                showAudioVisualizer: checked
            }
        });
    }

    const toggleDisplay = () => {
        const el = settingsRef.current;
        const isVisible = el.style.display !== 'none';

        if (isVisible) {
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
    }

    return (
        <div>
            <div data-text="Settings" className="cog tooltip" onClick={toggleDisplay}>
                <Settings className='icon' />
            </div>
            <div ref={settingsRef} id='settings' className='container cell settings'>
                <div className="header marker m-animated">
                    <h1>Settings</h1>
                </div>
                <TextInput id="input-set-username" labelText='Nickname' helpText='Your nickname below'
                    autoComplete='off' placeholder='Guest' value={username}
                    onInput={(value) => setUsername(value)} />
                <Checkbox id='checkbox-visualizer' checked={showAudioVisualizer}
                    onChecked={setAudioVisualizer} text='Show audio visualizer'
                    style={{ marginTop: '20px', alignItems: 'center' }} />
            </div>
        </div>
    )
}

export default function Options() {
    return (
        <div id='options' className='col'>
            <SettingsContainer />
            <AvatarContainer />
        </div>
    )
}