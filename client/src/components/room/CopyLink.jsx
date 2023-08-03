import React, { useState } from "react";
import { CopyAllRounded, Visibility } from '@mui/icons-material';


export default function BubbleCopyLink({ id }) {
    const [visible, setVisible] = useState(true);

    function _onClickCopyCode() {
        navigator.clipboard.writeText("http://localhost:3000/room/" + id);
    }

    return (
        <div className='container copy-link-container'>
            <div className='row'>
                <span className={visible ? 'hide-blur' : ''}>
                    {id}
                </span>
                <button onClick={_onClickCopyCode}>
                    <CopyAllRounded htmlColor='white' />
                </button>
                <button onClick={() => setVisible(!visible)}>
                    <Visibility htmlColor='white' />
                </button>
            </div>
        </div>
    );
}