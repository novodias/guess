import { MusicNote } from '@mui/icons-material';
import './Logo.css';
import React from 'react';
import { Link } from 'react-router-dom';

export default function LogoRitmovu() {
    return (
        // <Link to={"/"} className='logo-ritmovu'>
        //     Ritmovu
        // </Link>
        <Link to={"/"} className='logo-ritmovu'>
            <span>Ri</span>
            <MusicNote stroke={"black"} strokeWidth={"0.3"} strokeOpacity={"1"} />
            <span>movu</span>
        </Link>
    )
}