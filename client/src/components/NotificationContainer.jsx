import React from 'react';
import Notification from './Notification';
import './NotificationContainer.css';
import { useNotificationContext } from '../context/NotificationProvider';

export default function NotificationContainer() {
    const { notifications } = useNotificationContext();

    return (
        <div id="notification-wrapper">
            {notifications.map((pop, idx) => {
                return <Notification key={pop.uid} {...pop} batchNumber={idx + 1} />
            })}
        </div>
    )
}