import React, { useRef, useState, useEffect } from 'react';
import './Slider.css';

/**
 * @callback callbackRef
 * @param {HTMLElement} ref
 */

/**
 * 
 * @param {MutableRefObject<T>} ref 
 * @param {callbackRef} callback 
 */
function refCallback (ref, callback) {
    if (ref.current !== null) {
        callback(ref.current);
    }
}

/**
 * @param {Object} param0 
 * @param {("vertical"|"horizontal")} param0.orient 
 * @param {Number} param0.max 
 * @param {Number} param0.min 
 * @param {Number} param0.value 
 * @param {function(value)} param0.onChange 
 */
export default function Slider({ orient, max, min, defaultValue, onChange }) {
    const thumbRef = useRef(null);
    // const [value, setValue] = useState(defaultValue);
    const [press, setPress] = useState(false);

    /**
     * @callback callbackSpan
     * @param {HTMLSpanElement}
     */

    /**
     * @param {callbackSpan} callback 
     */
    const thumbInvoke = (callback) => {
        refCallback(thumbRef, (thumb) => {
            callback(thumb);
        });
    }

    const calculate = (value) => {
        return Math.round(min + value * (max - min));
    }

    const clamp = (value) => {
        return Math.min(Math.max(value, min), max);
    }

    const setThumb = (value) => {
        if (orient === 'horizontal') {
            thumbInvoke((thumb) => {
                thumb.style.left = `${value}%`;
            });
        } else {
            thumbInvoke((thumb) => {
                thumb.style.top = `${value}%`;
            });
        }
    }

    const invokeEvent = (value) => {
        if (onChange !== undefined) {
            onChange(value);
        }
    }

    const getValue = (e) => {
        const { left, width, top, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        const xValue = clamp(calculate(x));
        const yValue = clamp(calculate(y));

        return orient === 'horizontal' ? xValue : yValue;
    }

    /** 
     * @param {import('react').MouseEvent} e
     */
    const onMouseMove = (e) => {
        if (!press) {
            return;
        }

        const value = getValue(e);
        setThumb(value);
        invokeEvent(value);
    }

    /** 
     * @param {MouseEvent} e
     */
    const onMouseDown = (e) => {
        // left click
        if (e.button !== 0) {
            return;
        }

        const value = getValue(e);
        setThumb(value);
        invokeEvent(value);
        setPress(true);
    }

    /** 
     * @param {MouseEvent} e
     */
    const onMouseUp = (e) => {
        // left click
        if (e.button !== 0) {
            return;
        }

        setPress(false);
    }

    useEffect(() => {
        const value = (defaultValue / max) * (max - min) + min;
        
        if (orient === 'horizontal') {
            thumbInvoke((thumb) => {
                thumb.style.left = `${value}%`;
            });
        } else {
            thumbInvoke((thumb) => {
                thumb.style.top = `${value}%`;
            });
        }
    }, [max, min, defaultValue, orient])
    
    return (
        <div className='slider' orient={orient} 
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseOut={() => setPress(false)}
            onMouseMove={onMouseMove}>
            <span className='range'></span>
            <span ref={thumbRef} className='thumb'></span>
        </div>
    );
}