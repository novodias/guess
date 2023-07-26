import React, { Component } from 'react';
import YoutubePlayer from '../components/YoutubePlayer';
import Guest from '../components/room/Guest';
import { GuestAnswerStatus } from '../components/room/Guest';
import './Room.css';
import { useLoaderData, useLocation, useNavigate, useParams } from 'react-router-dom';

class RoomPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
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

        const room = this.props.router.loader;

        this.setState({ guests: room.players });

        // const id = this.props.router.params.id;
        // fetch(`http://localhost:3001/api/room/get/${id}`)
        //     .then((response) => {
        //         if (response.status === 404) {
        //             throw new Response("Not Found", { status: response.status })
        //         }
                
        //         return response.json();
        //     })
        //     .then(room => {
        //         console.log(room);
        //         this.setState({ guests: room.players });
        //     })
        //     .catch(error => {
        //         throw error;
        //     });
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

export default withRouter(RoomPage);