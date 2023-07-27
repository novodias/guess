import React, { Component } from 'react';
import './Options.css';

class OptionsBubble extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nickname: "",
            // volume: 25,
        };
    }

    // setVolume = (event) => {
    //     this.setState({ volume: event.target.value });
    // }

    setNickname = (event) => {
        this.setState({ nickname: event.target.value });
    }

    componentDidMount() {
        const nickname = sessionStorage.getItem("nickname");

        if (nickname === null) {
            this.setState({ nickname: "Guest" });
        } else {
            this.setState({ nickname });
        }
    }

    componentWillUnmount() {
        sessionStorage.setItem("nickname", this.state.nickname);
    }

    render() {
        return (
            <div className='bubble'>
                <h1>Options</h1>
                <hr />
                <div>
                    <label htmlFor='options-nickname-input'>Nickname</label>
                    <input type="text" id='options-nickname-input' placeholder='Guest'
                        value={this.state.nickname} onInput={this.setNickname} />
                </div>
                {/* <div>
                    <label htmlFor='options-volume-range'>Volume {this.state.volume}</label>
                    <input type="range" max={100} min={0} step={1} onInput={this.setVolume}
                        id='options-volume-range' value={this.state.volume} />
                </div> */}
            </div>
        );
    }
}

export default OptionsBubble;