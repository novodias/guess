import React, { useEffect, useState } from 'react';

/**
 * @param {Object} props 
 * @param {import('react').MutableRefObject<HTMLElement|null>} props.targetRef 
 */
export default function Collapse({ targetRef }) {
    const el = targetRef.current;
    const [isCollapsed, set] = useState(true);
    const collapseState = isCollapsed ? "collapsed" : "uncollapsed";

    const onClick = () => set(t => !t);

    useEffect(() => {
        if (el) {
            el.setAttribute("collapse", collapseState);
        }
    }, [isCollapsed, el, collapseState]);

    return (
        <div className='separator'
            data-collapse-id={el ? el.id : null}
            data-collapse={collapseState}
            onClick={onClick}>
        </div>
    )
}