import React, { useState } from "react";
import { CopyAllRounded, Visibility, VisibilityOff } from '@mui/icons-material';


export default function BubbleCopyLink({ id }) {
    const [visible, setVisible] = useState(true);

    function CopyCode() {
        const port = import.meta.env.PROD ? "" : ":3000";
        const adr = protocol + location.hostname + port;
        navigator.clipboard.writeText(adr + "/room/" + id);
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