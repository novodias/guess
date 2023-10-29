import React, { useRef, useEffect, useState } from 'react';
import './Popup.css';
import { usePopupDispatchContext } from '../context/PopupProvider';

/**
 * @param {Object} props 
 * @param {string} props.text 
 * @param {("bottom"|"top")} props.orient 
 * @param {number} props.gap 
 * @param {number} props.batchNumber 
 * @param {boolean} props.hasButton 
 * @param {string} props.buttonText 
 * @param {function(MouseEvent)} props.onButtonClick 
 * @param {function()} props.onDone 
 * @param {boolean} props.waitForClick 
 * 
 */
export default function Popup({
    text, orient, gap, batchNumber, close, uid,
    hasButton, buttonText, onButtonClick, /** onDone,*/
    waitForClick }) {
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const popupRef = useRef(null);
    const rafRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const duration = 600;

    const [initialLoad, setInitialLoad] = useState(true);
    const { remove } = usePopupDispatchContext();

    const buttonClick = (e) => {
        if (onButtonClick) {
            onButtonClick(e);
            remove(uid);
        }
    }

    function Button() {
        if (!hasButton) {
            return null;
        }

        return (
            <button className='btn' onClick={buttonClick}>
                {buttonText}
            </button>
        )
    }
    
    useEffect(() => {
        function easeOutCubic(num) {
            return 1 - Math.pow(1 - num, 3);
        }
    
        const setPopupPos = (value) => {
            popupRef.current.style[orient] = value + 'px';
        }

        const tick = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const { height } = popupRef.current.getBoundingClientRect();
            const finalPos = height * batchNumber + gap * batchNumber;
            const percent = elapsed / duration;
            const wishPos = finalPos * easeOutCubic(percent);
            
            if (elapsed < duration) {
                setPopupPos(wishPos);
                rafRef.current = requestAnimationFrame(tick);
            } else {
                if (wishPos !== finalPos) {
                    setPopupPos(finalPos);
                }
                
                cancelAnimationFrame(rafRef.current);
    
                // doesnt expect a click, sets a timer to call ondone
                if (waitForClick === false) {
                    setTimeout(() => remove(uid), 1000 * 7);
                }
            }
        }

        if (initialLoad) {
            tick();
            setInitialLoad(false);
            
            if (waitForClick) {
                if (!hasButton) {
                    popupRef.current.onclick = () => remove(uid);
                    popupRef.current.style.cursor = "pointer";
                }
            }
        }
    }, [initialLoad, waitForClick, hasButton, batchNumber, gap, orient, remove, uid]);

    useEffect(() => {
        if (close) {
            remove(uid);
        }
    }, [close, remove, uid]);
    
    return (
        <div ref={popupRef} className='popup'>
            <span>{text}</span>
            <Button />
        </div>
    )
}