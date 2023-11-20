import React, { createContext, useContext, useEffect, useState } from 'react';
import { next } from '../utils';
import { getAvatars } from '../api/client';

const SettingsContext = createContext(undefined);
const SettingsDispatchContext = createContext(undefined);
let totalAvatars = 0;

export const getTotalAvatars = () => totalAvatars;

function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        username: "Guest",
        avatar: 0,
        showAudioVisualizer: true
    });

    useEffect(() => {
        async function setAvatar() {
            const { total, /* avatars */ } = await getAvatars();
            totalAvatars = total;
            setSettings(stg => {
                return {
                    ...stg,
                    avatar: next(1, total)
                }
            });
        }

        setAvatar();
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            <SettingsDispatchContext.Provider value={setSettings}>
                {children}
            </SettingsDispatchContext.Provider>
        </SettingsContext.Provider>
    );
}

/**
 * @returns {{username: string, avatar: number, showAudioVisualizer: boolean}}
 */
const useSettingsContext = () => {
    return useContext(SettingsContext);
}

/**
 * @returns {React.Dispatch<React.SetStateAction<{username: string;avatar: number;showAudioVisualizer: boolean;}>>}
 */
const useSettingsDispatchContext = () => {
    return useContext(SettingsDispatchContext);
}

export {
    SettingsProvider, useSettingsContext, useSettingsDispatchContext,
    SettingsContext, SettingsDispatchContext
};