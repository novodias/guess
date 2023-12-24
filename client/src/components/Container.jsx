import React from 'react';

function Container({children, header, className}) {
    return (
        <div className={`container ${(className || '')}`}>
            {header !== undefined && <div className='header marker'>
                <h1>{header}</h1>
            </div>}
            {children}
        </div>
    )
}

Container.Header = ({children, animated}) => {
    return (
        <div className={`header marker ${animated ? 'm-animated' : ''}`}>
            <h1>{children}</h1>
        </div>
    )
}

export default Container;