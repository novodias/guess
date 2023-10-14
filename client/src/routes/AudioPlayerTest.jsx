import React, { useRef } from 'react';
import AudioPlayer from '../components/room/AudioPlayer';
import { getMusicUrl } from '../api/client';

const day = getMusicUrl("undertale", "bonetrousle");

function refCallback (ref, callback) {
    if (ref.current !== null) {
        callback(ref.current);
    }
}


export default function AudioPlayerTestPage() {
    const canvasRef = useRef(null);
    /**
     * @callback callbackCanvas
     * @param {HTMLCanvasElement} callback 
     */

    /**
     * @param {callbackCanvas} callback
     */
    function canvasCallback(callback) {
        refCallback(canvasRef, (canvas) => {
            if (!(canvas instanceof HTMLCanvasElement)) {
                return;
            }

            callback(canvas);
        });
    }

    return (
        <>
            <canvas id="canvas" ref={canvasRef} width={320} height={240}></canvas>
            <AudioPlayer src={day} startTime={30} play={true} canvasCallback={canvasCallback} /> 
        </>
    )
}