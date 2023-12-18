import { useRef, MutableRefObject } from 'react';

export default function useCanvasRef() {
    /**
     * @type {MutableRefObject<HTMLCanvasElement|null>}
     */
    const canvasRef = useRef(null);
    return canvasRef;
}