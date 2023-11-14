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
                <PopupProvider>
                    <Header />
                        <RoomProvider>
                            <main>
                                <section className='main-content'>
                                    <Outlet />
                                </section>
                            </main>
                        </RoomProvider>
                    <footer></footer>
                    <PopupList />
                </PopupProvider>
            </SettingsProvider>
        </>
    )
}