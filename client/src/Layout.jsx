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
                                <Outlet />
                            </main>
                        </RoomProvider>
                    <footer></footer>
                    <div class='bg-visual'>
                        <svg id="visual" viewBox="0 0 550 400" width="100%" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" version="1.1">
                            <path d="M0 97L92 77L183 77L275 117L367 85L458 97L550 121L550 0L458 0L367 0L275 0L183 0L92 0L0 0Z" fill="#e6e9ee"></path><path d="M0 157L92 129L183 133L275 173L367 161L458 157L550 177L550 119L458 95L367 83L275 115L183 75L92 75L0 95Z" fill="#d1d5ec"></path><path d="M0 193L92 177L183 173L275 213L367 185L458 201L550 205L550 175L458 155L367 159L275 171L183 131L92 127L0 155Z" fill="#c9bde6"></path><path d="M0 269L92 269L183 265L275 273L367 273L458 265L550 285L550 203L458 199L367 183L275 211L183 171L92 175L0 191Z" fill="#cca2d7"></path><path d="M0 317L92 321L183 313L275 309L367 309L458 313L550 317L550 283L458 263L367 271L275 271L183 263L92 267L0 267Z" fill="#d485bd"></path><path d="M0 337L92 353L183 349L275 345L367 345L458 349L550 337L550 315L458 311L367 307L275 307L183 311L92 319L0 315Z" fill="#db6598"></path><path d="M0 373L92 381L183 369L275 369L367 377L458 381L550 369L550 335L458 347L367 343L275 343L183 347L92 351L0 335Z" fill="#d9456a"></path><path d="M0 401L92 401L183 401L275 401L367 401L458 401L550 401L550 367L458 379L367 375L275 367L183 367L92 379L0 371Z" fill="#cc2936"></path>
                        </svg>
                    </div>
                    <NotificationContainer />
                </NotificationProvider>
            </SettingsProvider>
        </>
    )
}