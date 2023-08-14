import React from 'react';
import './Dropdown.css';

export default function Dropdown({children, display, className}) {

    return (
        <div className={`dropdown ${className || ''}`}>
            <ul className='remove-ul-li-style'>
                {children}
            </ul>
        </div>
    )
}