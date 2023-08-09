import React, { useState } from "react";
import { CopyAllRounded, Visibility } from '@mui/icons-material';


export default function BubbleCopyLink({ id }) {
    const [visible, setVisible] = useState(true);

    function CopyCode() {
        // navigator.clipboard.writeText("http://localhost:3000/room/" + id);
        // navigator.clipboard.writeText(process.env.REACT_APP_URL + "/room/" + id);
        navigator.clipboard.writeText(window.location.hostname + "/room/" + id);
    }

    return (
        <div className='container copy-link-container'>
            <div className='row'>
                <span className={visible ? 'hide-blur' : ''}>
                    {id}
                </span>
                <button onClick={CopyCode}>
                    <CopyAllRounded htmlColor='white' />
                </button>
                <button onClick={() => setVisible(!visible)}>
                    <Visibility htmlColor='white' />
                </button>
            </div>
        </div>
    );
}