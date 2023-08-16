import React, { createContext, useState } from 'react';

const SettingsContext = createContext(undefined);
const SettingsDispatchContext = createContext(undefined);

function SettingsProvider({ children }) {
    const [settingsDetails, setSettingsDetails] = useState({
        username: "Guest",
        quality: "360p"
    });

    const setSettings = ({ username = null, quality = null }) => {
        setSettingsDetails({
            username: username || settingsDetails.username,
            quality: quality || settingsDetails.quality
        });
    }

    return (
        <SettingsContext.Provider value={settingsDetails}>
            <SettingsDispatchContext.Provider value={setSettings}>
                {children}
            </SettingsDispatchContext.Provider>
        </SettingsContext.Provider>
    );
}

export { SettingsProvider, SettingsContext, SettingsDispatchContext };