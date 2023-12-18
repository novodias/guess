import React, { useState } from 'react';
import { MessageRounded } from '@mui/icons-material';
import './Chat.css';

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
            return (
                <div className='tooltip emote-token' data-text={`:${emoji.id}:`}>
                    <img src={emoji.src} width="36" height="36"
                        alt={`Emote ${emoji.id}`}></img>
                </div>
            )
        } else {
            return <span className='message-token'>{v}</span>
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
                <div className='chat-header'>Chatroom</div>
                <ul className='col messages-list'>
                    {
                        messages.map((message, key) => {
                            return <li key={key}>
                                <div className='chat-message'>
                                    <span>
                                        <h2 style={message.isSystem && { color: "crimson" }}>
                                            {message.nickname}
                                        </h2>
                                        <span>
                                            {replaceTextWithEmojis(message.text)}
                                        </span>
                                    </span>
                                </div>
                            </li>
                        })
                    }
                    {/* <div id='anchor'></div> */}
                </ul>
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