import * as React from 'react';
import './Navbar.css';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import OptionsBubble from '../components/Options';
import { Link } from 'react-router-dom';

const Navbar = ({ showOptions, onClick }) => {
    
    // const createOptions = () => {
    //     // if (showOptions !== true) {
    //     //     return null
    //     // }

    //     return ();
    // }
    
    return (
        <>
            <nav id='navbar'>
                <ul className='flex-row'>
                    <li>
                        <Link to="/" has-icon=""><HomeIcon /></Link>
                    </li>
                    <li>
                        <Link to="/add">Add</Link>
                    </li>
                    {/* <li>
                        <Link to={"/room"}>Room</Link>
                    </li> */}
                    {/* <li>
                        <Link to={"/suggest"}>Suggest</Link>
                    </li> */}
                    {/* <li>
                        <Link to={"/error"}>Error</Link>
                    </li> */}
                    <li at-end="">
                        <button className='btn' has-icon="" onClick={onClick}>
                            <SettingsIcon />
                        </button>
                    </li>
                </ul>
            </nav>
            <OptionsBubble hide={!showOptions} />
        </>
    );
}

export default Navbar;