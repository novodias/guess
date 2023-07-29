import React from 'react';
import { CheckRounded, CloseRounded } from '@mui/icons-material'

export default function Alert({ message, type }) {

    return (
        <div className={`alert alert-${type}`}>
            <span>{message}</span>
            <div className='icon-container'>
                { type === 'success' ? <CheckRounded /> : null}
                { type === 'danger' ? <CloseRounded /> : null}
            </div>
        </div>
    );
}