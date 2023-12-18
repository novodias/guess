import React from 'react';

export default function Container({children, header, className}) {
    return (
        <div className={`container ${(className || '')}`}>
            {header !== undefined && <div className='header marker'>
                <h1>{header}</h1>
            </div>}
            {children}
        </div>
    )
}