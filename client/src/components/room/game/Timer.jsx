import React, { useRef, useEffect } from 'react';
import './Timer.css';

/**
 * @param {Object} props 
 * @param {("start"|"stop"|"revert"|"none")} props.playState 
 */
export default function Timer({ state, timerDuration, prepareDuration }) {
    /**
     * @type {import('react').MutableRefObject<HTMLDivElement>}
     */
    const timerRef = useRef(undefined);
    // const className = state === 'none' ? '' : state;

    useEffect(() => {
        if (timerRef.current) {
            switch (state) {
                case "start":
                    timerRef.current.style.animation = `start_timer ${timerDuration}s forwards ease-out`;
                    break;
                
                case "revert":
                    timerRef.current.style.animation = `go_back_timer ${prepareDuration}s forwards linear`;
                    break;
            }
        }
    }, [state]);
    
    return (
        <div ref={timerRef} className='timer'></div>
    )
}
