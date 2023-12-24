import React, { useRef, useState } from 'react';
import { getTotalAvatars, useSettingsContext, useSettingsDispatchContext } from '../../context/SettingsProvider';
import Checkbox from '../elements/Checkbox';
import TextInput from '../elements/TextInput';
import { Settings } from '@mui/icons-material';
import LazyImage from '../elements/Image';
import useToggleDisplay from '../../hooks/useToggleDisplay';

function AvatarContainer() {
    const { avatar } = useSettingsContext();
    const setSettings = useSettingsDispatchContext();
    const avatarsRef = useRef(undefined);
    const toggleAvatars = useToggleDisplay(avatarsRef, true);
    // const [showAvatars, setShowAvatars] = useState(false);

    const setAvatar = (num) => {
        setSettings(stg => {
            return {
                ...stg,
                avatar: num
            }
        });
    }

    const total = getTotalAvatars();

    function Avatar({num}) {
        const url = `cdn/avatars/${num}`;

        return (
            <span className='avatar-selectable darken'
                onClick={() => setAvatar(num)}>
                <LazyImage src={url} alt={'Avatar ' + num} />
            </span>
        )
    }

    const SelectableAvatars = () => {
        const avatars = [];
        for (let i = 1; i < total + 1; i++) {
            avatars.push(<Avatar key={i} num={i} />);
        }
        return avatars;
    }

    const AvatarsContainer = () => {
        return (
            <div ref={avatarsRef} className={`row avatars-selectable-container container hide`}>
                <SelectableAvatars />
            </div>
        )
    }

    return (
        <div data-text="Your avatar" className={`avatars-container tooltip`} onClick={toggleAvatars}>
            <LazyImage className='your-avatar' src={`cdn/avatars/${avatar}`} alt='Your avatar' />
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
    const toggleSettings = useToggleDisplay(settingsRef, true);

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

    // const toggleDisplay = () => {
    //     const el = settingsRef.current;
    //     // const isVisible = el.style.display !== 'none' && el.style.display !== '';

    //     // if (isVisible) {
    //     //     el.style.display = 'none';
    //     // } else {
    //     //     el.style.display = 'block';
    //     // }

    //     if (el.classList.contains("hide")) {
    //         el.classList.add("show");
    //         el.classList.remove("hide");
    //     } else {
    //         el.classList.add("hide");
    //         el.classList.remove("show");
    //     }
    // }

    return (
        <div>
            <div data-text="Settings" className="cog tooltip" onClick={toggleSettings}>
                <Settings className='icon' />
            </div>
            <div ref={settingsRef} id='settings' className='container cell settings hide'>
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