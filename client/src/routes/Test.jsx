import React, { useEffect, useRef } from 'react';
import './Test.css';
import { Animation } from '../animation';

export default function AudioPlayerTestPage() {
    /**
     * @type {import('react').MutableRefObject<HTMLDivElement>}
     */
    const divRef = useRef(undefined);

    useEffect(() => {
        divRef.current.style.top = '0px';
        divRef.current.style.left = '0px';
        
        const animation = new Animation(divRef.current);
        animation.ease = 'easeOutCubic';
        animation.onframe = ({percent}) => {
            animation.node.style.top = (500 * percent) + 'px';
            animation.node.style.left = (800 * percent) + 'px';
        }

        animation.onstart = () => {
            console.log("start");
        }
        animation.onend = () => {
            console.log("end");
        }
        animation.start(5000, 1000, 0);

        divRef.current.onclick = () => animation.reverse();

        return () => {
            animation.stop();
        }
    }, []);
    
    return (
        <div className='test' ref={divRef}>
            Animation Test
        </div>
    )
}