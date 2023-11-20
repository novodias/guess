import React from 'react';

export default function Container({children, headerText, isContent, className}) {
    return (
        <div className={`container${' ' + className}`}>
            {headerText !== undefined && <div className='header-container'>
                <h2>{headerText}</h2>
            </div>}
            {isContent === true ? <div className='inner-container'>{children}</div> :  children}
        </div>
    )
}