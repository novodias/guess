import './Navbar.css';
import * as React from 'react';
import { Link } from 'react-router-dom';
import LogoRitmovu from '../components/Logo';
import { AddRounded } from '@mui/icons-material';

const Navbar = () => {
    return (
        <nav id='navbar'>
            <ul className='flex-row'>
                <li>
                    <LogoRitmovu />                    
                </li>
                <li>
                    <Link to="/add">
                        <AddRounded fontSize='60' />
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;