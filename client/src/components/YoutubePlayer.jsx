import { LoopRounded, PauseRounded, PlayArrowRounded, VolumeUpRounded } from "@mui/icons-material";
import React, { Component } from "react";
import YouTube from "react-youtube";
import "./YoutubePlayer.css";

export default class YoutubePlayer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            videoId: this.props.videoId,
            video: null,
            interval: null,
            progress: 0,
            volume: 25,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.videoId !== this.props.videoId) {
            this.loadVideoById(this.props.videoId);
        }
    }

    _onReady = (event) => {
        // access to player in all event handlers via event.target
        event.target.pauseVideo();
        this.updateVideoState(event.target);
    }

    updateVideoState = (target, callbackfn) => {
        this.setState({ video: target }, callbackfn);
    }

    loadVideoById = (id) => {
        this.state.video.loadVideoById(id);
    }

    _onStateChange = (event) => {
        this.updateVideoState(event.target);
    }

    _onPlay = () => {
        if (this.state.video === null) {
            return;
        }

        this.startProgress();
    }

    _onPause = () => {
        if (this.state.video === null) {
            return;
        }

        this.stopProgress();
    }

    _onEnd = () => {
        if (this.state.video === null) {
            return;
        }

        this.stopProgress();
    }

    renderIframe = () => {
        if (this.state.videoId) {
            const opts = {
                height: '390',
                width: '640',
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                },
            };

            return (
                <YouTube
                    videoId={this.state.videoId}
                    opts={opts}
                    onReady={this._onReady}
                    onPlay={this._onPlay}
                    onPause={this._onPause}
                    onEnd={this._onEnd}
                    onStateChange={this._onStateChange} />
            );
        }

        return null;
    }

    startProgress = () => {
        if (this.state.video === null) {
            return;
        }

        this.setState({ interval: setInterval(() => {
            const videoDuration = this.state.video.getDuration();
            const videoTime = this.state.video.getCurrentTime();
            const percentage = (videoTime / videoDuration).toFixed(5);
            
            this.setState({ percentage });
            
            }, 200)
        })
    }

    stopProgress = () => {
        clearInterval(this.state.interval)
    }

    play = () => {
        if (this.state.video === null) {
            return;
        }

        const playerState = this.state.video.getPlayerState();

        // Playing
        if (playerState === 1) {
            this.state.video.pauseVideo();
        // Paused
        } else if (playerState !== 1) {
            this.state.video.playVideo();
        }
    }

    getVolume = () => {
        if (this.state.video === null) {
            return this.state.volume;
        }

        return this.state.video.getVolume() ?? this.state.volume;
    }

    updateVolume = () => {
        if (this.state.video === null) {
            return;
        }

        this.state.video.setVolume(this.state.volume);
    }

    setStateVolume = (event) => {
        this.setState({ volume: event.target.value });
    }

    setVolume = (event) => {
        this.setState({ volume: event.target.value });
        
        if (this.state.video === null) {
            return;
        }

        this.updateVolume();
    }

    getIcon = () => {
        if (this.state.video === null) {
            return;
        }
        
        const playerState = this.state.video.getPlayerState();

        // Playing
        if (playerState === 1) {
            return (<PauseRounded />);
        // Paused
        } else if (playerState === 2) {
            return (<PlayArrowRounded />);
        // Buffering
        } else if (playerState === 3) {
            return (<LoopRounded className='rotate-loop' />);
        }

        return (<PlayArrowRounded />);
    }

    render() {
        return (
            <div id="video-container">
                <div id="video-responsive">
                    {this.renderIframe()}
                </div>
                <div className="video-controls">
                    <button onClick={this.play}>
                        {this.getIcon()}
                    </button>
                    <div className="progress-wrapper">
                        <div className="progress-bar">
                            <span className="progress-dot" style={{left: `${415 * this.state.percentage}px`}}>
                            </span>
                        </div>
                    </div>
                    <div className="volume-control">
                        <VolumeUpRounded sx={{ color: "black" }} />
                        <div className="volume-dropdown">
                            <input type="range"
                                value={this.getVolume()}
                                min="0" max="100" step="1"
                                onInput={this.setVolume} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}