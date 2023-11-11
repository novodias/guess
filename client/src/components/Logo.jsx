// import { MusicNote } from '@mui/icons-material';
import './Logo.css';
import React from 'react';
import { Link } from 'react-router-dom';
import header_logo from '../assets/imgs/logo.png';

export default function LogoRitmovu() {
    return (
        <Link to={"/"} className='logo-ritmovu'>
            <img src={header_logo} alt='Logo'></img>
        </Link>
    )
}