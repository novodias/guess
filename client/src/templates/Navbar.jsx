import * as React from 'react';
import './Navbar.css';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsBubble from '../components/Options';
import { Link } from 'react-router-dom';

const Navbar = ({ showOptions, onClick }) => {
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
                    <li at-end="">
                        <button className='btn' has-icon="" onClick={onClick}>
                            <SettingsIcon />
                        </button>
                    </li>
                </ul>
            </nav>
            <SettingsBubble hide={!showOptions} />
        </>
    );
}

export default Navbar;