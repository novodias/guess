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
            // remove(uid);
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

    const setPopupPos = useCallback((value) => {
        popupRef.current.style[orient] = value + 'px';
    }, [orient]);

    const popupDisplayNone = useCallback(() => {
        popupRef.current.style.display = 'none';
    }, []);

    const Animate = useCallback(({ wishPos, finalPos, elapsed }, onNextFrame, onEnd) => {
        if (elapsed < duration) {
            setPopupPos(wishPos);
            rafRef.current = requestAnimationFrame(onNextFrame);
        } else {
            if (wishPos !== finalPos) {
                setPopupPos(finalPos);
            }
            
            cancelAnimationFrame(rafRef.current);
            onEnd();
            // doesnt expect a click, sets a timer to call ondone
            // if (waitForClick === false) {
            //     setTimeout(() => remove(uid), 1000 * 7);
            // }
        }
    }, [setPopupPos]);

    const AnimationEnd = useCallback(() => {
        startTimeRef.current = Date.now();
        
        const end = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = duration - elapsed;
            const { height } = popupRef.current.getBoundingClientRect();
            const finalPos = height * batchNumber + gap * batchNumber;
            const percent = remaining / duration;
            const wishPos = finalPos * easeOutCubic(percent);
    
            Animate({ wishPos, finalPos, elapsed }, end, () => {
                popupDisplayNone();
                remove(uid)
            });
        }

        end();
    }, [Animate, batchNumber, gap, remove, uid, popupDisplayNone]);

    const AnimationStart = useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const { height } = popupRef.current.getBoundingClientRect();
        const finalPos = height * batchNumber + gap * batchNumber;
        const percent = elapsed / duration;
        const wishPos = finalPos * easeOutCubic(percent);
        
        Animate({ wishPos, finalPos, elapsed }, AnimationStart, () => {
            if (waitForClick === false) {
                setTimeout(AnimationEnd, 1000 * 7);
            }
        });
    }, [Animate, AnimationEnd, batchNumber, gap, waitForClick]);
    
    useEffect(() => {
        // const tick = () => {
        //     const elapsed = Date.now() - startTimeRef.current;
        //     const { height } = popupRef.current.getBoundingClientRect();
        //     const finalPos = height * batchNumber + gap * batchNumber;
        //     const percent = elapsed / duration;
        //     const wishPos = finalPos * easeOutCubic(percent);
        //     if (elapsed < duration) {
        //         setPopupPos(wishPos);
        //         rafRef.current = requestAnimationFrame(tick);
        //     } else {
        //         if (wishPos !== finalPos) {
        //             setPopupPos(finalPos);
        //         }
        //         cancelAnimationFrame(rafRef.current);
        //         // doesnt expect a click, sets a timer to call ondone
        //         if (waitForClick === false) {
        //             setTimeout(() => remove(uid), 1000 * 7);
        //         }
        //     }
        // }

        if (initialLoad) {
            AnimationStart();
            setInitialLoad(false);
            
            if (waitForClick) {
                if (!hasButton) {
                    // popupRef.current.onclick = () => remove(uid);
                    popupRef.current.onclick = AnimationEnd;
                    popupRef.current.style.cursor = "pointer";
                }
            }
        }
    }, [initialLoad, waitForClick, hasButton, AnimationStart, AnimationEnd]);
    
    return (
        <div ref={popupRef} className='popup'>
            <span>{text}</span>
            <Button />
        </div>
    )
}