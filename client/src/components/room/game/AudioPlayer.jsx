import { LoopRounded, PauseRounded, PlayArrowRounded, VolumeDownRounded, VolumeMuteRounded, VolumeOffRounded, VolumeUpRounded } from "@mui/icons-material";
import React, { useState, useRef, useEffect, useMemo, MutableRefObject } from 'react'
import Slider from "../../Slider";
import AudioVisualizerContext from "../../../audioContext";
import useLogger from "../../../hooks/useLogger";
import CanvasWorker from './CanvasWorker';
import './AudioPlayer.css';
import useWebWorker from "../../../hooks/useWebWorker";

/**
 * @param {Object} props 
 * @param {HTMLAudioElement} props.audio 
 * @param {("none"|"play"|"pause"|"ended")} props.audioState 
 */
function PlayButtonIcon({ audio, audioState }) {
    const icon = () => {
        if (audioState === 'play')
            return <PauseRounded />;
        else 
            return <PlayArrowRounded />;
    }

    switch (audio.readyState) {
        case 0:
            return icon();
        
        case 1:
        case 2:
            return <LoopRounded className="loading" />;
                
        case 3:
        case 4:
            return icon();
    }
}

/**
 * @param {Object} props 
 * @param {string} props.src 
 * @param {boolean} props.play 
 * @param {number} props.startTime 
 * @param {boolean} props.playButtonDisabled 
 * @param {MutableRefObject<HTMLCanvasElement|null>} props.canvasRef 
 * @param {boolean} props.showAudioVisualizer 
 */
export default function AudioPlayer({ src, play, startTime, playButtonDisabled, canvasRef, showAudioVisualizer }) {
    const { info, debug } = useLogger("AudioPlayer");
    const audioRef = useRef(new Audio());
    const visualizerContextRef = useRef(new AudioVisualizerContext());

    const progressRef = useRef(null);
    const [audioState, setAudioState] = useState('none');
    const [volume, setVolume] = useState(audioRef.current.volume * 100);
    const [muted, setMuted] = useState(audioRef.current.muted);
    const worker = useWebWorker(CanvasWorker);

    useEffect(() => {
        if (showAudioVisualizer) {
            debug("Sent OffscreenCanvas to worker");
            const canvas = canvasRef.current;
            const offscreen = canvas.transferControlToOffscreen();
            worker.postMessage({ canvas: offscreen }, [offscreen]);
        }

        return () => {
            if (showAudioVisualizer) worker.terminate();
        }
    }, []);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (showAudioVisualizer && audio) {
            debug("Audio visualizer context created");
            visualizerContextRef.current.create(audio);
        }

        return () => {
            debug("Audio visualizer context disposed");
            visualizerContextRef.current.dispose();
            visualizerContextRef.current = null;
        }
    }, [showAudioVisualizer]);
    
    useEffect(() => {
        if (audioState !== 'play')
            return;

        if (canvasRef && showAudioVisualizer) {
            let frameId;
            const visualizer = visualizerContextRef.current;
            const { bufferLength, dataArray } = visualizer.getData();

            function animate() {
                if (audioState === 'pause') {
                    debug("Paused audio visualizer animation");
                    cancelAnimationFrame(frameId);
                    return;
                }

                visualizer.analyser.getByteFrequencyData(dataArray);
                worker.postMessage({ bufferLength, dataArray }, {});
                frameId = requestAnimationFrame(() => animate());
            }

            animate();

            return () => {
                debug("Canceled audio visualizer animation");
                cancelAnimationFrame(frameId);
            };
        }
    }, [showAudioVisualizer, audioState]);

    useEffect(() => {
        const audioContext = visualizerContextRef.current;
        const audio = audioRef.current;

        audio.muted = true;
        setMuted(audio.muted);
        
        audio.onplay = (e) => {
            setAudioState('play');
            if (audioContext.context) audioContext.context.resume();
        };
        
        audio.onpause = (e) => {
            if (audioContext.context) audioContext.context.suspend();
            setAudioState('pause');
        };

        audio.onended = (e) => {
            if (audioContext.context && audioContext.context.state === "running") 
                audioContext.context.suspend();
            setAudioState('ended');
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;

        const percentage = () => {
            let percent = 0;
            percent = (audio.currentTime / audio.duration).toFixed(5);
            return percent;
        };

        let frameId;
        const update = () => {
            const percent = percentage();
            const el = progressRef.current;
            el.style.left = `${percent * 100}%`;
            frameId = requestAnimationFrame(() => update());
        };

        function cancel() {
            if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = undefined;
                debug("Canceled progress bar animation");
            }
        }

        if (audioState === 'play') {
            update();
        } else {
            cancel();
        }

        return () => {
            cancel();
        }
    }, [audioState]);

    useEffect(() => {
        if (src) {
            debug(`Set audio source to ${src}`);
            const audio = audioRef.current;
            audio.src = src;
        }
    }, [src]);

    useEffect(() => {
        if (play) {
            const audio = audioRef.current;
            if (startTime) audio.currentTime = startTime;
            audio.play();
        }
    }, [play]);

    function ClickPlayHandler() {
        const audio = audioRef.current;
        if (audioState === 'play') {
            audio.pause();
        } else {
            audio.play();
        }
    }

    function VolumeButtonIcon() {
        let icon = null;
    
        if (muted) {
            icon = <VolumeOffRounded />
        } else {
            if (volume === 0) {
                icon = <VolumeMuteRounded />
            } else if (volume <= 50) {
                icon = <VolumeDownRounded />
            } else {
                icon = <VolumeUpRounded />
            }
        }

        return icon;
    }

    function ClickVolumeHandler() {
        const audio = audioRef.current;
        audio.muted = !audio.muted;
        setMuted(audio.muted);
    }

    /**
     * 
     * @param {InputEvent} e 
     */
    function InputRangeVolumeHandler(e) {
        const audio = audioRef.current;
        audio.volume = e / 100;
        setVolume(e);
    }

    return (
        <div id="audio-ui">
            <button onClick={ClickPlayHandler} disabled={playButtonDisabled}>
                <PlayButtonIcon audio={audioRef.current} audioState={audioState} />
            </button>
            <div className="progress-wrapper">
                <div className="progress-bar"></div>
                <span ref={progressRef} className="progress-value"></span>
            </div>
            <div className="volume-wrapper">
                <button id="volume-btn" onClick={ClickVolumeHandler}>
                    <VolumeButtonIcon />
                </button>
                <div className="hidden-volume">
                    <div className="volume-values-wrapper">
                        <output id="volume-output">{volume}</output>
                        <Slider min={0} max={100} orient="vertical" value={volume} onChange={InputRangeVolumeHandler} />
                    </div>
                </div>
            </div>
            <audio ref={audioRef} controls controlsList='nodownload noremoteplayback'>
                Your browser doesn't have support for this.
            </audio>
        </div>
    )
}