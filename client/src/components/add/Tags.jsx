import './Tags.css'
import React, { useEffect, useRef, useState } from 'react';
import { AddBoxRounded, CloseRounded } from '@mui/icons-material';

export default function TagsContainer({ tagsFound }) {
    const [tags, setTags] = useState([]);
    const [tagText, setTagText] = useState('');
    const inputRef = useRef(null);
    
    useEffect(() => {
        if (tagsFound !== undefined || tagsFound.length !== 0) {
            setTags(tagsFound);
        }
    }, [setTags, tagsFound]);

    const AddTag = (value) => {
        setTags([...tags, value]);
        console.log(tags);
    }

    const RemoveLastTag = () => {
        setTags(array => array.filter((v, i) => i !== array.length - 1));
    }

    const _onChange = (e) => {
        setTagText(e.target.value);
    }

    const _onKeyUp = (e) => {
        e.preventDefault();
        
        if ((e.key === "Enter" || e.keyCode === 13) &&
            (tagText !== '' && tagText !== null)) {
            AddTag(tagText.trim());
            setTagText('');
        }
        
        if ((e.key === "Backspace" || e.keycode === 8) && tagText === '') {
            if (tags.length !== 0) {
                RemoveLastTag();
            }
            
        }
        
        return false;
    }

    const _onKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            return false;
        }
    }

    const _focusInput = () => {
        inputRef.current.focus();
    }

    
    function TagsWrapper() {
        const _removeTag = (i) => {
            if (tags.length !== 0) {
                setTags(t => t.filter((v, idx) => idx !== i));
            }
        }

        return (
            <div className='tags-wrapper row'>
                {tags.map((v, idx) =>
                    <span className='row'
                        key={idx} onClick={() => _removeTag(idx)}>
                        {v}
                        <CloseRounded fontSize='8px' />
                    </span>)
                }
            </div>
        );
    }

    return (
        <div className='tags-container container col'>
            <h2><AddBoxRounded /> Tags</h2>
            <h3>If not found, the title will be created with the song.</h3>
            <div className='tags-input-container col' onClick={_focusInput}>
                <input type='text' value={tagText} ref={inputRef}
                    onChange={_onChange} onKeyUp={_onKeyUp} onKeyDown={_onKeyDown} />
                <TagsWrapper />
            </div>
        </div>
    )
}