import React, { useContext, useEffect, useState, useRef } from 'react';
import './Options.css';
import { SettingsContext, SettingsDispatchContext } from '../context/SettingsProvider';

export default function SettingsBubble({ hide }) {
    const { username } = useContext(SettingsContext);
    const setSettingsDetails = useContext(SettingsDispatchContext);
    const [display, setDisplay] = useState('none');
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (hide) {
            timerRef.current = setTimeout(() => {
                setDisplay("none");
            }, 1000);
        } else {
            setDisplay("flex");
        }
    }, [hide]);

    const setUsername = (e) => {
        setSettingsDetails({
            username: e.target.value
        });
    }

    return (
        <div className={`bubble col ${hide ? 'hide' : 'spawn'}`} style={{ display: display }}>
            <div className='bubble-title'>
                <h1>Settings</h1>
            </div>
            <div>
                <label htmlFor='options-nickname-input'>Name</label>
                <input type="text" id='options-nickname-input' placeholder='Guest'
                    value={username} onInput={setUsername} />
            </div>
            <div className='bubble-space'></div>
            <div className='bubble-end'>
                <h3>The settings will be updated after closing.</h3>
            </div>
        </div>
    );
}

// class OptionsBubble extends Component {
//     constructor(props) {
//         super(props);

//         this.state = {
//             nickname: "",
//             display: "none",
//             timer: null
//         };
//     }

//     setNickname = (event) => {
//         this.setState({ nickname: event.target.value });
//     }

//     componentDidMount() {
//         const nickname = sessionStorage.getItem("nickname");
//         this.setState({ nickname: nickname || "Guest" });
//     }

//     componentDidUpdate(prevProps) {
//         if (prevProps.hide !== this.props.hide) {
//             if (this.state.timer !== null) {
//                 clearTimeout(this.state.timer);
//             }

//             if (this.props.hide) {
//                 this.setState({
//                     timer: setTimeout(() => {
//                         this.setState({ display: "none" });
//                     }, 1000)
//                 });
//             } else {
//                 this.setState({ display: "flex" });
//             }
//         }
//     }

//     componentWillUnmount() {
//         sessionStorage.setItem("nickname", this.state.nickname);
//     }

//     render() {
//         const display = this.state.display;

//         return (
//             <div className={`bubble col ${this.props.hide ? 'hide' : 'spawn'}`} style={{ display: display }}>
//                 <div className='bubble-title'>
//                     <h1>Settings</h1>
//                 </div>
//                 <div>
//                     <label htmlFor='options-nickname-input'>Name</label>
//                     <input type="text" id='options-nickname-input' placeholder='Guest'
//                         value={this.state.nickname} onInput={this.setNickname} />
//                 </div>
//                 <div className='bubble-space'></div>
//                 <div className='bubble-end'>
//                     <h3>The settings will be updated after closing.</h3>
//                 </div>
//             </div>
//         );
//     }
// }

// export default OptionsBubble;