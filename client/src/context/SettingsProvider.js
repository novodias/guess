import React, { createContext, useState } from 'react';

const SettingsContext = createContext(undefined);
const SettingsDispatchContext = createContext(undefined);

function SettingsProvider({ children }) {
    const [settingsDetails, setSettingsDetails] = useState({
        username: "Guest",
        quality: "360p"
    });

    return (
        <SettingsContext.Provider value={settingsDetails}>
            <SettingsDispatchContext.Provider value={setSettingsDetails}>
                {children}
            </SettingsDispatchContext.Provider>
        </SettingsContext.Provider>
    );
}

export { SettingsProvider, SettingsContext, SettingsDispatchContext };