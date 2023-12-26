import './Guest.css';
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, MutableRefObject } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PendingIcon from '@mui/icons-material/Pending';
import { LogoutRounded } from '@mui/icons-material';
import { getAvatarUrl } from '../../api/client';


export function Crown({ width, height, style }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width || "24"} height={height || "24"} viewBox="0 0 24 24"
        style={style || {filter: "drop-shadow(gray -1px -1px 0px)"}}>
            <path fill="currentColor" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z" />
        </svg>
    );
}

/**
 * @param {Object} obj
 * @param {number} obj.clientId
 * @param {any} obj.guest
 * @param {boolean} obj.inFirstPlace
 * @param {string} obj.owner
 * @param {boolean} obj.kickEnabled
 * @param {(id: number)} obj.KickPerson
 */
export const GuestContainer = ({ clientId, guest, inFirstPlace, owner, kickEnabled, KickPerson }) => {
    /**
     * @type {MutableRefObject<HTMLLIElement>}
     */
    const liRef = useRef(null);

    const KickButtonComponent = () => {
        if (!owner) {
            return null;
        }

        if (clientId === guest.id) {
            return null;
        }

        if (!kickEnabled || !owner) {
            return null;
        }

        return (
            <div className='btn-kick'>
                <button onClick={() => KickPerson(guest.id)}>
                    <LogoutRounded htmlColor='white' />
                </button>
            </div>
        )
    }

    const CrownComponent = () => {
        if (!inFirstPlace) return null;
        
        return (
            <div className='crown'>
                <Crown />
            </div>
        )
    }

    useEffect(() => {
        if (guest.status === GuestStatus.Correct) {
            liRef.current.setAttribute("status", "correct");
        } else if (guest.status === GuestStatus.Wrong) {
            liRef.current.setAttribute("status", "wrong");
        } else {
            liRef.current.setAttribute("status", "");
        }
    }, [guest.status]);
    
    return (
        <li ref={liRef} className='row guest-container'>
            <KickButtonComponent />
            <CrownComponent />
            <Guest {...guest} />
        </li>
    )
}

const Guest = ({ nickname, points, status, avatar }) => {
    const Status = () => {
        if (status === GuestStatus.Correct) {
            return (<CheckCircleIcon className='guest-status' />);
        } else if (status === GuestStatus.Pending) {
            return (<PendingIcon className='guest-status' />);
        }

        return (<CloseIcon className='guest-status' />);
    }

    return (
        <div className='guest-info'>
            <img className='avatar' src={getAvatarUrl(avatar)}
                width={44} height={44} alt='Avatar'></img>
            <div>
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