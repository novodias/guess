import React from 'react';
import './Spinner.css';

export default function Spinner({ sx, sy }) {
    let style;

    if (sx && sy) {
        style = {
            width: sx,
            height: sy
        };
    }
    
    return (
        <span className='loader' style={style}></span>
    )
}