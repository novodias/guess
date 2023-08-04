import React, { useDeferredValue, useState } from 'react';
import SearchResults from './SearchResults';

export default function InputTitles({ onDropdownClick, onKeyUp }) {    
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);

    const [titleFocus, setTitleFocus] = useState('');

    const _onTitleInput = (event) => {
        const text = event.target.value;
        setQuery(text);
        
        if (text !== '') {
            _onTitleFocusIn();
        } else {
            _onTitleFocusOut();
        }
    }

    function _onDropdownClick(title) {
        _onTitleFocusOut();
        setQuery(title.title);
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
            <input value={query} onChange={_onTitleInput} onKeyUp={onKeyUp}
                autoComplete="off" type="text" id="title-input"
                placeholder='Ex.: Portal 2' name='title' />
            <SearchResults query={deferredQuery} focus={titleFocus} onDropdownClick={_onDropdownClick} />
        </div>
    )
}