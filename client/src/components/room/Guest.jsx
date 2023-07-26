import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';

const Guest = ({ nickname, points, answer }) => {

    const createIcon = () => {
        if (answer === GuestAnswerStatus.Correct) {
            return (<CheckCircleIcon className='guest-status' />);
        } else if (answer === GuestAnswerStatus.Pending) {
            return (<PendingIcon className='guest-status' />);
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

export const GuestAnswerStatus = Object.freeze({
    Pending: 0,
    Correct: 1,
    Wrong: 2,
});

export default Guest;