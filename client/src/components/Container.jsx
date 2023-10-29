import React from 'react';

export default function Container({children, headerText, isContent}) {
    return (
        <div className='container'>
            {headerText !== undefined && <div className='header-container'>
                <h2>{headerText}</h2>
            </div>}
            {isContent === true ? <div className='inner-container'>{children}</div> :  children}
        </div>
    )
}