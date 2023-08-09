import React, { useState } from 'react';
import { MessageRounded } from '@mui/icons-material';

export default function Chat({ messages, onEnter }) {
    const [text, setText] = useState('');

    const _onKeyDown = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
        }
    }

    const _onKeyUp = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (!text || text === '' || text.startsWith('\n')) {
                setText('');
                return;
            } else {
                onEnter(text);
                setText('');
            }
        }
    }

    return (
        <>
            <div id='chat' className='col'>
                <ul className='remove-ul-li-style'>
                    {
                        messages.map((message, key) => {
                            return <li key={key}>
                                <div className='chat-message'>
                                    <span>
                                        <h2 style={message.isSystem && { color: "crimson" }}>
                                            {message.nickname}
                                        </h2>
                                        {message.text}
                                    </span>
                                </div>
                            </li>
                        })
                    }
                </ul>
                <div id='anchor'></div>
            </div>
            <div className='chat-textbox-container'>
                <textarea autoComplete='false' maxLength={200} value={text}
                    onInput={(e) => setText(e.target.value)}
                    onKeyUp={_onKeyUp} onKeyDown={_onKeyDown}></textarea>
                <span><MessageRounded /></span>
            </div>
        </>
    );
}