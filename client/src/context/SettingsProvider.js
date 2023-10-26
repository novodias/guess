import React, { createContext, useState } from 'react';

const SettingsContext = createContext(undefined);
const SettingsDispatchContext = createContext(undefined);

function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        username: "Guest",
        showAudioVisualizer: true
    });

    return (
        <SettingsContext.Provider value={settings}>
            <SettingsDispatchContext.Provider value={setSettings}>
                {children}
            </SettingsDispatchContext.Provider>
        </SettingsContext.Provider>
    );
}

export { SettingsProvider, SettingsContext, SettingsDispatchContext };