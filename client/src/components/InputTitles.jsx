import React, { useState } from 'react';
import Dropdown from './Dropdown';

// this one is a diferent, 
// the one in Create.jsx doesn't meet the requirements.
export default function InputTitles({ onDropdownClick, onKeyUp }) {

    // const [titleId, setTitleId] = useState(0);
    // const [titleType, setTitleType] = useState('');
    
    const [title, setTitle] = useState('');
    const [titles, setTitles] = useState([]);

    const getTitlesAsync = async (name, type) => {
        console.log("Fetching titles...");
        try {
            const response = await fetch(`${process.env.API}/titles?name=${name || ''}${(name && type) ? '&type=' + type : ''}`);
            const data = await response.json();

            if (data.length === 0) {
                setTitles([{ id: 0, title: "Not found", type: "", clickable: false }]);
            } else {
                setTitles(data);
            }
        } catch (error) {
        }
    }

    const [titleFocus, setTitleFocus] = useState('');

    // function _onDropdownClick(title) {
    //     onDropdownClick(title)
    // }

    const _onTitleInput = (event) => {
        const text = event.target.value;
        // let dontSet = false;

        // find any title name that matches with text
        const found = titles.find(val => val.title.toLowerCase()
            .startsWith(text.toLowerCase())
        );
        
        // if titles is empty, fetch more
        if (titles.length === 0) {

            if (title.length !== text.length) {
                getTitlesAsync(null, null);
            }

            setTitle(text);
            return;
        }

        // if input is not empty, focus
        if (text.length > 0) {
            setTitleFocus('title-input-focused');

            // if not found with text, get more
            if (!found) {
                getTitlesAsync(text, null);
            }
        } else {
            // setTitleId(0);
            setTitleFocus('');
        }
        
        // if (!dontSet) {
        // }
        setTitle(text);
    }

    function _onTitleFocusIn() {
        setTitleFocus('title-input-focused');
    }

    function _onTitleFocusOut() {
        if (title || title !== '') {
            return;
        }

        setTitleFocus('');
    }

    return (
        <div className='dropdown-input-container'>
            <input value={title} onInput={_onTitleInput} onKeyUp={onKeyUp}
                onFocus={_onTitleFocusIn} onBlur={_onTitleFocusOut}
                autoComplete="off" type="text" id="title-input"
                placeholder='Ex.: Portal 2' name='title' />
            <Dropdown className={titleFocus}>
                {titles
                    .filter(val => val.title.toLowerCase().startsWith(title.toLowerCase()))
                    .map((title, key) => {
                    return (
                        <li onClick={() => title.clickable !== false && onDropdownClick(title)} key={key} id={title.id}>
                            {title.title}
                        </li>
                    )
                })}
            </Dropdown>
        </div>
    )
}