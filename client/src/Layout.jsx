import React, { useState } from 'react';
import Navbar from './templates/Navbar';
import { Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsProvider';
import { RoomProvider } from './context/RoomProvider';

export default function Layout() {
    const [options, setOptions] = useState(false);
  
    const onClick = (event) => {
        setOptions(!options);
    }
    
    return (
        <>
            <SettingsProvider>
                <header>
                    <Navbar showOptions={options} onClick={onClick} />
                </header>
                <RoomProvider>
                    <main>
                        <Outlet />
                    </main>
                </RoomProvider>
            </SettingsProvider>
        </>
    )
}