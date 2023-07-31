import React from 'react';
import { CheckRounded, CloseRounded } from '@mui/icons-material'

export default function Alert({ message, type, style }) {

    return (
        <div className={`alert alert-${type}`} style={style}>
            <span>{message}</span>
            <div className='icon-container'>
                { type === 'success' ? <CheckRounded /> : null}
                { type === 'danger' ? <CloseRounded /> : null}
            </div>
        </div>
    );
}