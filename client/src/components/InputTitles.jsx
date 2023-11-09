import React, { useDeferredValue, useState } from 'react';
import SearchResults from './SearchResults';
import './InputTitles.css';

export default function InputTitles({ onDropdownClick, onKeyUp, readOnly, onText }) {    
    const [titleFocus, setTitleFocus] = useState('');
    
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);

    const _onTitleInput = (event) => {
        const text = event.target.value;
        setQuery(text);
        onText && onText(text);
        
        if (text) {
            _onTitleFocusIn();
        } else {
            _onTitleFocusOut();
        }
    }

    function _onDropdownClick(title) {
        _onTitleFocusOut();
        setQuery(title.name);
        onDropdownClick(title);
    }

    function _onTitleFocusIn() {
        setTitleFocus('title-input-focused');
    }

    function _onTitleFocusOut() {
        setTitleFocus('');
    }

    return (
        <div className='dropdown-input-container'>
            <input readOnly={readOnly} style={{ color: readOnly ? 'rgba(120, 120, 120)' : 'rgb(30, 30 ,30)' }}
                value={query} onChange={_onTitleInput} onKeyUp={onKeyUp}
                autoComplete="off" type="text" id="title-input"
                placeholder='Ex.: Portal 2' name='title' />
            <SearchResults query={deferredQuery}
                focus={titleFocus}
                onDropdownClick={_onDropdownClick} />
        </div>
    )
}