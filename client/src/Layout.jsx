import React from 'react';
import { Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsProvider';
import { RoomProvider } from './context/RoomProvider';
import { PopupProvider } from './context/PopupProvider';
import LogoRitmovu from './components/Logo';
import PopupList from './components/PopupList';

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
                <PopupProvider>
                    <RoomProvider>
                        <main>
                            <LogoRitmovu />
                            <Outlet />
                            <PopupList />
                        </main>
                    </RoomProvider>
                </PopupProvider>
            </SettingsProvider>
        </>
    )
}