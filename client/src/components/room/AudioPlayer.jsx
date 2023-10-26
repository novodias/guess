import { LoopRounded, PauseRounded, PlayArrowRounded, VolumeDownRounded, VolumeMuteRounded, VolumeOffRounded, VolumeUpRounded } from "@mui/icons-material";
import React, { useState, useRef, useEffect, useCallback } from 'react'
import './AudioPlayer.css';
import Slider from "../Slider";

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

let x = 0;

export default function AudioPlayer({ src, play, startTime, canvasCallback }) {
    const audioRef = useRef(new Audio());
    const audioCtxRef = useRef(new AudioContext());
    const audioSource = useRef(null);
    const analyser = useRef(null);

    const rafRef = useRef(null);
    const progressRef = useRef(null);
    const [playState, setPlayState] = useState('none');
    const [volume, setVolume] = useState(audioRef.current.volume * 100);
    const [muted, setMuted] = useState(audioRef.current.muted);

    const getAnalyser = () => {
        return analyser.current;
    }
    
    useEffect(() => {
        audioCallback((audio) => {
            if (audioSource.current === null) {
                audioSource.current = audioCtxRef.current.createMediaElementSource(audio);
            }
    
            if (analyser.current === null) {
                analyser.current = audioCtxRef.current.createAnalyser();
                audioSource.current.connect(analyser.current);
                analyser.current.connect(audioCtxRef.current.destination);
                analyser.current.fftSize = 128;
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
                    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth * 1.2;
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
            return () => {
                console.log("canceled frameid audio visualizer raf");
                cancelAnimationFrame(frameId);
            };
        })
    }, [canvasCallback]);

    /**
     * @callback callbackAudio
     * @param {HTMLAudioElement}
     * 
     * @callback callbackSpan
     * @param {HTMLSpanElement}
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

    /**
     * 
     * @param {callbackSpan} callback 
     */
    function progressInvoke(callback) {
        refCallback(progressRef, (span) => {
            if (!(span instanceof HTMLSpanElement)) {
                return;
            }

            callback(span);
        })
    }

    /**
     * 
     * @returns {Number|null}
     */
    const getPercentage = useCallback(() => {
        let percent = null;
        audioCallback((audio) => {
            percent = (audio.currentTime / audio.duration).toFixed(5);
        });
        return percent;
    }, []);

    const updateProgressStyle = useCallback(() => {
        const percent = getPercentage() || 0;
        progressInvoke((prog) => {
            prog.style.left = `${percent * 100}%`;
        });
    }, [getPercentage]);

    const setSource = useCallback((src) => audioCallback((audio) => {
        audio.src = src;
    }), []);

    const playAudio = useCallback(() => audioCallback((audio) => {
        audio.currentTime = startTime;
        audio.play();
    }), [startTime]);

    useEffect(() => {
        audioCallback((audio) => {
            audio.muted = true;
            setMuted(audio.muted);
            
            audio.onplay = (e) => {
                setPlayState('play');
                rafRef.current = requestAnimationFrame(updateProgressStyle);
                audioCtxRef.current.resume();
            };

            function cancelProgressRaf(calledOn = '') {
                cancelAnimationFrame(rafRef.current);
                console.log("canceled audio progress raf", calledOn);
            }
            
            audio.onpause = (e) => {
                setPlayState('pause');
                cancelProgressRaf('paused');
            };

            audio.onended = (e) => {
                cancelProgressRaf('ended');
            }
        });

        return () => {
            cancelAnimationFrame(rafRef.current);
            console.log("canceled audio progress raf");
        }
    }, [updateProgressStyle]);

    useEffect(() => {
        if (src) {
            setSource(src);
        }
    }, [src, setSource]);

    useEffect(() => {
        if (play) {
            playAudio();
        }
    }, [play, playAudio]);

    function PlaybackState() {
        let state = 0;
        audioCallback((audio) => {
            const readyState = audio.readyState;
            // (cannot play)
            if (readyState === HTMLMediaElement.HAVE_NOTHING) {
                state = 0;
            } else if (readyState === HTMLMediaElement.HAVE_CURRENT_DATA || 
                readyState === HTMLMediaElement.HAVE_METADATA) {
                state = 1;
            } else {
                state = 2;
            }
        });
        return state;
    }

    function PlaybackIcon() {
        const playbackState = PlaybackState();

        let icon = null;
        switch (playbackState) {
            case 0:
                icon = <PlayArrowRounded />;
                break;
            
            case 1:
                icon = <LoopRounded className="loading" />;
                break;
                    
            case 2:
                if (playState === 'pause') {
                    icon = <PlayArrowRounded />;
                } else {
                    icon = <PauseRounded />;
                }
                break;

            default:
                icon = <PauseRounded />;
                break;
        }

        return icon;
    }

    function onClickPlayControl() {
        audioCallback((audio) => {
            const state = PlaybackState();
            if (state === 2) {
                if (playState === 'play') {
                    audio.pause();
                } else {
                    audio.play();
                }
            }
        });
    }

    function VolumeStateIcon() {
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

    function onClickVolume() {
        audioCallback((audio) => {
            audio.muted = !audio.muted;
            setMuted(audio.muted);
        });
    }

    /**
     * 
     * @param {InputEvent} e 
     */
    function onInputRangeVolume(e) {
        audioCallback((audio) => {
            audio.volume = e / 100;
            setVolume(e);
        });
    }

    return (
        <div id="audio-ui">
            <button onClick={onClickPlayControl} disabled>
                <PlaybackIcon />
            </button>
            <div className="progress-wrapper">
                <div className="progress-bar"></div>
                <span ref={progressRef} className="progress-value"></span>
            </div>
            <div className="volume-wrapper">
                <button id="volume-btn" onClick={onClickVolume}>
                    <VolumeStateIcon />
                </button>
                <div className="hidden-volume">
                    <div className="volume-values-wrapper">
                        <output id="volume-output">{volume}</output>
                        {/* <input type="range" id="volume-slider" max={100} min={0}
                            value={VolumeValue()} onInput={onInputRangeVolume}></input> */}
                        <Slider min={0} max={100} orient="vertical" value={25} onChange={onInputRangeVolume} />
                    </div>
                </div>
            </div>
            <audio ref={audioRef} controls controlsList='nodownload noremoteplayback'>
                Your browser doesn't have support for this.
            </audio>
        </div>
    )
}