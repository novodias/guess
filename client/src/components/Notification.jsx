import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Notification.css';
import { useNotificationDispatchContext } from '../context/NotificationProvider';
import { AnimationNodeHelper } from '../animation';

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
export default function Notification({
    text, orient, gap, batchNumber, uid,
    hasButton, buttonText, onButtonClick, /** onDone,*/
    waitForClick }) {
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const notificationRef = useRef(null);
    const animRef = useRef(null);

    const [initialLoad, setInitialLoad] = useState(true);
    const { remove } = useNotificationDispatchContext();

    const onClick = (e) => {
        if (onButtonClick) {
            onButtonClick(e);
            _out();
        }
    }
    
    function Button() {
        if (!hasButton) {
            return null;
        }

        return (
            <button className='btn' onClick={onClick}>
                {buttonText}
            </button>
        )
    }

    const _out = useCallback(() => {
        if (animRef.current) {
            animRef.current.stop();
        }

        if (waitForClick) {
            if (!hasButton) {
                notificationRef.current.onclick = null;
                notificationRef.current.style.cursor = "default";
            }
        }

        const pos = { y: -10, x: 0 };
        const direction = { y: orient };

        animRef.current = AnimationNodeHelper.move(
            notificationRef.current,
            null,
            pos,
            600,
            "easeOutCubic",
            direction,
            () => {
                notificationRef.current.style.display = 'none';
                remove(uid);
            }
        );
    }, [hasButton, orient, remove, uid, waitForClick])

    const _in = useCallback(() => {
        const { height } = notificationRef.current.getBoundingClientRect();
        const desired = height * batchNumber + gap * batchNumber;
        const pos = { y: desired, x: 0 };
        const direction = { y: orient };

        animRef.current = AnimationNodeHelper.move(
            notificationRef.current,
            null,
            pos,
            600,
            "easeOutCubic",
            direction,
            (initial) => {
                if (!initial) return;
                if (waitForClick === false) {
                    setTimeout(_out, 1000 * 7);
                }
            }
        );
    }, [batchNumber, gap, orient, waitForClick, _out]);
    
    useEffect(() => {
        if (initialLoad) {
            _in();
            setInitialLoad(false);

            if (waitForClick) {
                if (!hasButton) {
                    notificationRef.current.onclick = _out;
                    notificationRef.current.style.cursor = "pointer";
                }
            }
        } else if (!initialLoad && batchNumber) {
            animRef.current.stop();
            _in();
        }
    }, [_in, _out, batchNumber, hasButton, initialLoad, waitForClick]);
    
    return (
        <div ref={notificationRef} className='notification'>
            <span>{text}</span>
            <Button />
        </div>
    )
}