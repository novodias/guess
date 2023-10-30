import { useCallback, useRef } from 'react';

function refCallback (ref, callback) {
    if (ref.current !== null) {
        callback(ref.current);
    }
}

/**
 * @callback callbackCanvas
 * @param {HTMLCanvasElement} callback 
 */

/**
 * @typedef CanvasRef
 * @property {import('react').MutableRefObject<HTMLCanvasElement> | null} current
 * @property {callbackCanvas} invoke
 */

/**
 * 
 * @returns {CanvasRef}
 */

export default function useCanvasRef() {
    /**
     * @type {CanvasRef}
     */
    const canvasRef = useRef(null);

    /**
     * @param {callbackCanvas} callback
     */
    const canvasCallback = useCallback((callback) => {
        refCallback(canvasRef, (canvas) => {
            if (!(canvas instanceof HTMLCanvasElement)) {
                return;
            }

            callback(canvas);
        });
    }, []);

    canvasRef.invoke = canvasCallback;
    return canvasRef;
}