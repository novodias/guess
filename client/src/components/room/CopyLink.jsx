import React, { useState } from "react";
import { CopyAllRounded, Visibility, VisibilityOff } from '@mui/icons-material';


export default function BubbleCopyLink({ id }) {
    const [visible, setVisible] = useState(true);

    function CopyCode() {
        navigator.clipboard.writeText(window.location.protocol + '//' + import.meta.env.VITE_APP_URL + "/room/" + id);
    }

    return (
        <div className='container copy-link-container'>
            <div className='row'>
                <span className={visible ? 'copy-link hide' : 'copy-link show'}>
                    {id}
                </span>
                <button onClick={CopyCode}>
                    <CopyAllRounded />
                </button>
                <button onClick={() => setVisible(!visible)}>
                    {visible ? <Visibility /> : <VisibilityOff />}
                </button>
            </div>
        </div>
    );
}