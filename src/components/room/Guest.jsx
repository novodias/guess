import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

const Guest = ({ nickname, points, done }) => {

    const createIcon = () => {
        if (done) {
            return (<CheckCircleIcon className='guest-status' />);
        }

        return (<CloseIcon className='guest-status' />);
    }

    return (
        <>
            <div className='guest-info'>
                <div>
                    <AccountCircleIcon />
                    <h3>{nickname}</h3>
                </div>
                <i>Points: {points}</i>
                {createIcon()}
            </div>
        </>
    );
}

export default Guest;