import './Room.css';
import React, { Component } from 'react';
// import YoutubePlayer from '../components/YoutubePlayer';
import Guest from '../components/room/Guest';
// import { Status } from '../components/room/Guest';
import withRouter from '../components/WithRouter';
import { Navigate } from 'react-router-dom';
import BubbleCopyLink from '../components/room/CopyLink';

class RoomPage extends Component {
    constructor(props) {
        super(props)
        
        const room = this.props.router.loader;

        this.state = {
            room_id: room.id,
            guests: [],
            videoIdInput: "",
            videoId: "fhUqu-g0pVY",
            // codeVisible: false,
        }

    }

    componentDidMount() {
        const room = this.props.router.loader;
        
        window.history.replaceState(null, "Room", "/room");
        
        this.ws = new WebSocket("ws://localhost:3001");

        let nickname = sessionStorage.getItem("nickname");
        nickname = nickname === null ? "Guest" : nickname;

        this.ws.onopen = (event) => {
            const message = {
                type: "joined",
                body: {
                    nickname,
                    room_id: room.id
                }
            }

            console.log("conectado")
            this.ws.send(JSON.stringify(message));
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);

            if (message.type === "players") {
                const players = message.body;
                this.setState({
                    guests: players
                });
            }
        }
    }

    componentWillUnmount() {
        this.ws.close();
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

    // _onClickCopyCode = () => {
    //     navigator.clipboard.writeText("http://localhost:3000/room/" + this.state.room_id);
    // }

    render() {
        return (
            <>
                {this.props.router.loader.requirePassword &&
                    <Navigate
                        to={`/enter/${this.props.router.loader.id}`}
                        state={this.props.router.loader} />}
                {/* <div className='container copy-link-container'>
                    <div className='row'>
                        <span className={this.state.codeVisible ? 'hide-blur' : ''}>
                            {this.state.room_id}
                        </span>
                        <button onClick={this._onClickCopyCode}>
                            <CopyAllRounded htmlColor='white' />
                        </button>
                        <button onClick={() => this.setState({ codeVisible: !this.state.codeVisible})}>
                            <Visibility htmlColor='white' />
                        </button>
                    </div>
                </div> */}
                <BubbleCopyLink id={this.state.room_id} />
                <div id='guests-container'>
                    <ul>
                        {this.state.guests.map((v, i) => {
                            return (
                                <li key={i}>
                                    <Guest {...v} />
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className='room-container'>
                    <input id='room-input-guess' type="text" placeholder='Video ID...'
                        value={this.state.videoIdInput} onInput={this._onInput} onKeyUp={this._onKeyUp} />
                    {/* <YoutubePlayer videoId={this.state.videoId} /> */}
                </div>
            </>
        );
    }
}

export async function RoomLoader({ params }) {
    let passwordHash = sessionStorage.getItem("RoomPasswordHash");
    passwordHash && sessionStorage.removeItem("RoomPasswordHash");

    const res = await fetch(`http://localhost:3001/api/room/${params.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ passwordHash })
    });

    if (!res.ok) {
        if (res.status !== 400) {
            throw new Error("Could not fetch to the server");
        }

        return await res.json();
    }
    
    if (res.status === 404) {
        throw new Response("Not Found", { status: 404 });
    }
    
    const data = await res.json();

    return data;
}

export default withRouter(RoomPage);