import React, { useState } from 'react';
import Navbar from './templates/Navbar';
import { Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsProvider';
import { RoomProvider } from './context/RoomProvider';
import LogoRitmovu from './components/Logo';

export default function Layout() {
    // const [options, setOptions] = useState(false);
  
    // const onClick = (event) => {
    //     setOptions(!options);
    // }
    
    return (
        <>
            <SettingsProvider>
                {/* <header>
                    <Navbar showOptions={options} onClick={onClick} />
                </header> */}
                <RoomProvider>
                    <main>
                        <LogoRitmovu />
                        <Outlet />
                    </main>
                </RoomProvider>
            </SettingsProvider>
        </>
    )
}