import * as React from 'react';
import './Navbar.css';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import OptionsBubble from '../components/Options';

const Navbar = ({ showOptions, onClick }) => {
    
    const createOptions = () => {
        if (showOptions !== true) {
            return null
        }

        return (<OptionsBubble />);
    }
    
    return (
        <>
            <nav id='navbar'>
                <ul className='flex-row'>
                    <li>
                        <a href={`/`} has-icon=""> 
                            <HomeIcon /> 
                        </a>
                    </li>
                    <li>
                        <a href={`/create`}>Create</a>
                    </li>
                    <li>
                        <a href={`/room`}>Room</a>
                    </li>
                    <li>
                        <a href={`/suggest`}>Suggest</a>
                    </li>
                    <li>
                        <a href={`/error`}>Error</a>
                    </li>
                    <li at-end="">
                        <button className='btn' has-icon="" onClick={onClick}>
                            <SettingsIcon />
                        </button>
                    </li>
                </ul>
            </nav>
            {createOptions()}
        </>
    );
}

export default Navbar;