import React, { useRef, useEffect, useState, useCallback } from 'react';
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
    text, orient, gap, batchNumber, uid,
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
            AnimationEnd();
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

    function easeOutCubic(num) {
        return 1 - Math.pow(1 - num, 3);
    }

    const getPopupPos = useCallback(() => {
        if (popupRef.current === null) return undefined;
        return parseFloat(popupRef.current.style[orient] || 0);
    }, [orient]);

    const setPopupPos = useCallback((value) => {
        if (popupRef.current === null) return;
        popupRef.current.style[orient] = value + 'px';
    }, [orient]);

    const popupDisplayNone = useCallback(() => {
        if (popupRef.current === null) return;
        popupRef.current.style.display = 'none';
    }, []);

    const Animate = useCallback(({ wishPos, desiredPos, elapsed }, onNextFrame, onEnd) => {
        if (elapsed < duration) {
            setPopupPos(wishPos);
            rafRef.current = requestAnimationFrame(onNextFrame);
        } else {
            if (wishPos !== desiredPos) {
                setPopupPos(desiredPos);
            }
            
            cancelAnimationFrame(rafRef.current);
            onEnd();
        }
    }, [setPopupPos]);

    const AnimationEnd = useCallback(() => {
        // cancel the start animation raf if is running
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        
        startTimeRef.current = Date.now();
        if (waitForClick) {
            if (!hasButton) {
                popupRef.current.onclick = null;
                popupRef.current.style.cursor = "default";
            }
        }
        
        const end = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const percent = elapsed / duration;
            const currentPos = getPopupPos();
            
            // weird stuff here, when removed, the raf still goes
            if (currentPos === undefined) {
                cancelAnimationFrame(rafRef.current);
                popupDisplayNone();
                remove(uid);
            }

            const desiredPos = -10;
            const wishPos = desiredPos + (currentPos - desiredPos) * easeOutCubic(1 - percent);
    
            Animate({ wishPos, desiredPos, elapsed }, end, () => {
                popupDisplayNone();
                remove(uid);
            });
        }

        end();
    }, [waitForClick, hasButton, getPopupPos, Animate, popupDisplayNone, remove, uid]);

    const AnimationStart = useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current;
        
        const { height } = popupRef.current.getBoundingClientRect();
        const desiredPos = height * batchNumber + gap * batchNumber;
        const currentPos = getPopupPos();

        const percent = elapsed / duration;
        let wishPos = desiredPos * easeOutCubic(percent);

        // this goes down
        if (currentPos > desiredPos) {
            wishPos = desiredPos + (currentPos - desiredPos) * easeOutCubic(1 - percent);
        }
        
        Animate({ wishPos, desiredPos, elapsed }, AnimationStart, () => {
            if (waitForClick === false) {
                setTimeout(AnimationEnd, 1000 * 7);
            }
        });
    }, [Animate, AnimationEnd, getPopupPos, batchNumber, gap, waitForClick]);
    
    useEffect(() => {
        if (initialLoad) {
            AnimationStart();
            setInitialLoad(false);
            
            if (waitForClick) {
                if (!hasButton) {
                    popupRef.current.onclick = AnimationEnd;
                    popupRef.current.style.cursor = "pointer";
                }
            }
        } else if (!initialLoad && batchNumber) {
            startTimeRef.current = Date.now();
            AnimationStart();
        }
    }, [initialLoad, waitForClick, hasButton, batchNumber, AnimationStart, AnimationEnd]);
    
    return (
        <div ref={popupRef} className='popup'>
            <span>{text}</span>
            <Button />
        </div>
    )
}