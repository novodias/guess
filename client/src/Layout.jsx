import React from 'react';
import { Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsProvider';
import { RoomProvider } from './context/RoomProvider';
import { PopupProvider } from './context/PopupProvider';
import PopupList from './components/PopupList';
import Header from './templates/Header';

export default function Layout() {
    return (
        <>
            <SettingsProvider>
                <Header />
                <PopupProvider>
                    <RoomProvider>
                        <main>
                            <Outlet />
                            <PopupList />
                        </main>
                    </RoomProvider>
                </PopupProvider>
            </SettingsProvider>
        </>
    )
}