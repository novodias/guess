import './Room.css';
import React, { Component } from 'react';
import YoutubePlayer from '../components/YoutubePlayer';
import Guest from '../components/room/Guest';
// import { Status } from '../components/room/Guest';
import { useLoaderData, useLocation, useNavigate, useParams } from 'react-router-dom';

class RoomPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            room_id: "",
            guests: [
                // { nickname: "novodias", points: 69, answer: GuestAnswerStatus.Correct },
                // { nickname: "xxClebeRxx", points: 24, answer: GuestAnswerStatus.Pending },
                // { nickname: "thekronn0s", points: -1, answer: GuestAnswerStatus.Wrong },
            ],
            videoIdInput: "",
            videoId: "fhUqu-g0pVY",
        }
    }

    componentDidMount() {
        window.history.replaceState(null, "Room", "/room");

        const room = this.props.router.loader;
        this.setState({ room_id: room.id });
        
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

    render() {
        return (
            <>
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
                    <YoutubePlayer videoId={this.state.videoId} />
                </div>
            </>
        );
    }
}

function withRouter(Component) {
    function RoomWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        let loader = useLoaderData();

        return (
          <Component
            {...props}
            router={{ location, navigate, params, loader }}
          />
        );
    }

    return RoomWithRouterProp;
}

export async function RoomLoader({ params }) {
    const res = await fetch(`http://localhost:3001/api/room/get/${params.id}`);
    if (!res.ok) {
        throw new Error("Could not fetch to the server");
    }
    
    if (res.status === 404) {
        throw new Response("Not Found", { status: 404 });
    }
    
    const data = await res.json();
    return data;
}

export default withRouter(RoomPage);