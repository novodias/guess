import React, { Component } from 'react';
import YoutubePlayer from '../components/YoutubePlayer';
import Guest from '../components/room/Guest';
import './Room.css';

class RoomPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            guests: [
                { nickname: "novodias", points: 69, done: true },
                { nickname: "xxClebeRxx", points: 24, done: false },
                { nickname: "thekronn0s", points: -1, done: false },
            ],
            videoIdInput: "",
            videoId: "fhUqu-g0pVY",
            videoPlayer: null,
        }
    }

    _onInput = (event) => {
        this.setState({ videoIdInput: event.target.value });
    }

    _onKeyUp = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            const videoId = this.state.videoIdInput;
            this.setState({ videoId, videoIdInput: "" });
        }
    }

    render() {
        return (
            <>
                <div id='guests-container'>
                    {this.state.guests.map((v, i) => <Guest key={i} {...v} />)}
                </div>
                <div className='room-container'>
                    <input id='room-input-guess' type="text" placeholder='Video ID...'
                        value={this.state.videoIdInput} onInput={this._onInput} onKeyUp={this._onKeyUp} />
                    <YoutubePlayer videoId={this.state.videoId} />
                </div>
            </>
        );
    }
}

export default RoomPage;