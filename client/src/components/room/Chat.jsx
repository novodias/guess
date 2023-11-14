import React, { useState } from 'react';
import { MessageRounded } from '@mui/icons-material';

const getEmoji = (id) => `<img src='/cdn/avatars/${id}' width="44" height="44" alt='Emote ${id}'></img>`

const emojis = {
    ":1:": getEmoji('1'),
    ":2:": getEmoji('2'),
    ":3:": getEmoji('3'),
    ":4:": getEmoji('4'),
    ":5:": getEmoji('5'),
    ":6:": getEmoji('6'),
    ":7:": getEmoji('7'),
    ":8:": getEmoji('8'),
    ":9:": getEmoji('9'),
    ":10:": getEmoji('10'),
    ":11:": getEmoji('11'),
    ":12:": getEmoji('12'),
    ":13:": getEmoji('13'),
    ":14:": getEmoji('14'),
    ":15:": getEmoji('15'),
    ":16:": getEmoji('16'),
    ":17:": getEmoji('17'),
    ":18:": getEmoji('18'),
    ":19:": getEmoji('19'),
    ":20:": getEmoji('20'),
    ":21:": getEmoji('21'),
    ":22:": getEmoji('22'),
    ":23:": getEmoji('23'),
    ":24:": getEmoji('24'),
    ":25:": getEmoji('25'),
    ":26:": getEmoji('26'),
}

/**
 * @param {string} message
 */
const replaceTextWithEmojis = (message) => {
    let count = 0;
    let text = '';
    message.split(' ').forEach((curr) => {
        if (emojis[curr]) {
            count++;
            text += ` ${emojis[curr]}`;
        } else {
            text += ' <p>' + curr + '</p>';
        }
    });
    return count > 0 ? text : '<p>' + message + '</p>';
}

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
                                        <span dangerouslySetInnerHTML={{__html: replaceTextWithEmojis(message.text)}}></span>
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