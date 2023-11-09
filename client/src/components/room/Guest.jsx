import './Guest.css';
import React from 'react';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';

const Guest = ({ nickname, points, status }) => {

    const Status = () => {
        if (status === GuestStatus.Correct) {
            return (<CheckCircleIcon className='guest-status' />);
        } else if (status === GuestStatus.Pending) {
            return (<PendingIcon className='guest-status' />);
        }

        return (<CloseIcon className='guest-status' />);
    }

    const GuestBg = () => {
        if (status === GuestStatus.Correct) {
            return 'guest-correct';
        } else if (status === GuestStatus.Wrong) {
            return 'guest-wrong';
        }

        return '';
    }

    return (
        <div className={`guest-info ${GuestBg()}`}>
            <img className='avatar' src='cdn/avatars/8'
                width={44} height={44} alt='Avatar'></img>
            <div>
                {/* <AccountCircleIcon /> */}
                <span>{nickname}</span>
                <i>Points: {points}</i>
            </div>
            <Status />
        </div>
    );
}

export const GuestStatus = Object.freeze({
    Pending: 0,
    Correct: 1,
    Wrong: 2,
});

export default Guest;