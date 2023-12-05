import React from 'react';
import { Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsProvider';
import { RoomProvider } from './context/RoomProvider';
import { NotificationProvider } from './context/NotificationProvider';
import NotificationContainer from './components/NotificationContainer';
import Header from './templates/Header';

export default function Layout() {
    return (
        <>
            <SettingsProvider>
                <NotificationProvider>
                    <Header />
                        <RoomProvider>
                            <main>
                                <section className='main-content'>
                                    <Outlet />
                                </section>
                            </main>
                        </RoomProvider>
                    <footer></footer>
                    <NotificationContainer />
                </NotificationProvider>
            </SettingsProvider>
        </>
    )
}