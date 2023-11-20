import React, { useState } from 'react';
import { MessageRounded } from '@mui/icons-material';

// const getEmoji = (id) => `<img src='/cdn/avatars/${id}' width="44" height="44" alt='Emote ${id}'></img>`
const getEmoji = (id) => {
    return { src: `/cdn/avatars/${id}`, id };
}

const emojis = {}
for (let i = 0; i < 26; i++) {
    let num = i + 1;
    Object.defineProperty(emojis, `:${num}:`, {
        value: getEmoji(num),
        writable: false
    });
}

/**
 * @param {string} message
 */
const replaceTextWithEmojis = (message) => {
    return message.split(' ').map((v) => {
        const emoji = emojis[v];
        if (emoji) {
            return <img src={emoji.src} width="36" height="36" alt={`Emote ${emoji.id}`}></img>
        } else {
            return <p>{v}</p>
        }
    })
}
// const replaceTextWithEmojis = (message) => {
//     let count = 0;
//     let text = '';
//     message.split(' ').forEach((curr) => {
//         if (emojis[curr]) {
//             count++;
//             text += ` ${emojis[curr]}`;
//         } else {
//             text += ' <p>' + curr + '</p>';
//         }
//     });
//     return count > 0 ? text : '<p>' + message + '</p>';
// }

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
                                        <span /* dangerouslySetInnerHTML={{__html: replaceTextWithEmojis(message.text)}} */>
                                            {replaceTextWithEmojis(message.text)}
                                        </span>
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