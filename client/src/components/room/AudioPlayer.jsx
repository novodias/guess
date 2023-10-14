import React, { useRef, useEffect, useCallback } from 'react'

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

const audioCtx = new window.AudioContext();
let audioSource = null;
let analyser = null;
let x = 0;

/**
 * 
 * @returns {null | AnalyserNode}
 */
const getAnalyser = () => {
    return analyser;
}

export default function AudioPlayer({ src, play, startTime, canvasCallback }) {
    const audioRef = useRef(new Audio());
    
    useEffect(() => {
        audioCallback((audio) => {
            if (audioSource === null) {
                audioSource = audioCtx.createMediaElementSource(audio);
            }
    
            if (analyser === null) {
                analyser = audioCtx.createAnalyser();
                audioSource.connect(analyser);
                analyser.connect(audioCtx.destination);
                analyser.fftSize = 128;
            }
        });
    }, []);
    
    useEffect(() => {
        canvasCallback((canvas) => {
            const ctx = canvas.getContext("2d");
            const drawVisualizer = ({
                bufferLength,
                dataArray,
                barWidth
            }) => {
                let barHeight;
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];
                    // const red = (i * barHeight) / 10;
                    // const green = i * 4;
                    // const blue = barHeight / 4 - 12;
                    ctx.fillStyle = `black`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth;
                }
            };
    
            const node = getAnalyser();
            const bufferLength = node.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const barWidth = canvas.width / bufferLength;
            let frameId;
            
            function animate() {
                x = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                node.getByteFrequencyData(dataArray);
                drawVisualizer({
                    bufferLength, dataArray, barWidth
                });
    
                frameId = requestAnimationFrame(animate);
            }
    
            animate();
            return () => cancelAnimationFrame(frameId);
        })
    }, [canvasCallback]);

    /**
     * @callback callbackAudio
     * @param {HTMLAudioElement}
     */

    /**
     * @param {*} ref 
     * @param {callbackAudio} callback 
     */
    function audioCallback(callback) {
        refCallback(audioRef, (audio) => {
            if (!(audio instanceof HTMLAudioElement)) {
                return;
            }

            callback(audio);
        });
    }

    const setSource = useCallback((src) => audioCallback((audio) => {
        audio.src = src;
    }), []);

    const playAudio = useCallback(() => audioCallback((audio) => {
        audio.currentTime = startTime;
        audio.play();
    }), [startTime]);

    useEffect(() => {
        if (src) {
            audioCtx.resume();
            setSource(src);
        }

    }, [src, play, playAudio, setSource]);

    return (
        <audio ref={audioRef} controls>
            Your browser doesn't have support for this.
        </audio>
    )
}