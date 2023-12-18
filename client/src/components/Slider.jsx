import React, { useRef, useState, useEffect, useCallback } from 'react';
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
    /**
     * @type {import('react').MutableRefObject<HTMLDivElement>}
     */
    const sliderRef = useRef(null);
    const thumbRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

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

    const setThumb = useCallback((value) => {
        const dir = orient === 'horizontal' ? 'left' : 'top';
        thumbInvoke((thumb) => {
            thumb.style[dir] = (100 - value) + '%';
        });
    }, [orient]);

    const invokeEvent = (value) => {
        if (onChange !== undefined) {
            onChange(value);
        }
    }

    /** 
     * @param {import('react').MouseEvent} e
     */
    const getValue = (e) => {
        // const { left, width, top, height } = e.currentTarget.getBoundingClientRect();
        const { left, width, top, height } = sliderRef.current.getBoundingClientRect();
        const x = 1 - ((e.clientX - left) / width);
        const y = 1 - ((e.clientY - top) / height);

        const xValue = clamp(calculate(x));
        const yValue = clamp(calculate(y));

        return orient === 'horizontal' ? xValue : yValue;
    }

    /** 
     * @param {import('react').MouseEvent} e
     */
    const onMouseMove = (e) => {
        if (!isDragging) {
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
        setIsDragging(true);
    }

    /** 
     * @param {MouseEvent} e
     */
    const onMouseUp = (e) => {
        // left click
        if (e.button !== 0) {
            return;
        }
        setIsDragging(false);
    }

    useEffect(() => {
        if (initialLoad) {
            setThumb(defaultValue);
            setInitialLoad(false);
        }
    }, [initialLoad, setThumb, defaultValue]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mouseup", onMouseUp);
            window.addEventListener("mousemove", onMouseMove);
        } else {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }
    });
    
    return (
        <div ref={sliderRef} className='slider' orient={orient} 
            onMouseDown={onMouseDown}>
            <span className='range'></span>
            <span ref={thumbRef} className='thumb'></span>
        </div>
    );
}