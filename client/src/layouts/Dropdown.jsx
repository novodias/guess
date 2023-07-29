import React from 'react';

export default function Dropdown({children, display, className}) {

    return (
        <div className={`dropdown ${className || ''}`}>
            <ul className='remove-ul-li-style'>
                {children}
            </ul>
        </div>
    )
}