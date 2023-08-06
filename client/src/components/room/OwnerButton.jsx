import React from 'react';

export default function OwnerButton({ owner, showKickBtn, setShowKickBtn }) {
    if (!owner) {
        return null;
    }

    return (
        <div className='row'>
            <input type='checkbox' defaultChecked={false} id='checkbox-show-kick-btn' value={showKickBtn}
                onChange={(e) => setShowKickBtn(e.target.checked)}/>
            <label htmlFor='checkbox-show-kick-btn'>Show kick button</label>
        </div>
    )
}