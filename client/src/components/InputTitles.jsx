import React, { useDeferredValue, useRef, useState, MutableRefObject, useEffect } from 'react';
import SearchResults from './SearchResults';
import './InputTitles.css';
import { noop } from '../utils';

/**
 * @param {Object} props 
 * @param {MouseEvent} props.onDropdownClick 
 * @param {KeyboardEvent} props.onKeyUp 
 * @param {boolean} props.readOnly 
 * @param {*} props.onText 
 */
export default function InputTitles({ onDropdownClick, onKeyUp, onKeyDown, readOnly, onText }) {    
    /**
     * @type {MutableRefObject<HTMLInputElement>}
     */
    const inputRef = useRef(undefined);
    const [focus, setFocus] = useState(false);
    const [selected, setSelected] = useState(0);
    const [length, setLength] = useState(0);
    const [isSelected, setIsSelected] = useState(false);
    
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);

    const InputHandler = (event) => {
        const text = event.target.value;
        setQuery(text);
        onText && onText(text);
        setFocus(true);
        setSelected(0);
    }

    const DropdownClickHandler = (title) => {
        setFocus(false);
        setQuery(title.name);
        onDropdownClick(title);
    }

    const HandleArrowUp = () => {
        if (!focus) return;
        setSelected(s => {
            if (s === 0) return s;
            return --s;
        });
    }

    const HandleArrowDown = () => {
        if (!focus) return;
        setSelected(s => {
            if (s === length - 1) return s;
            return ++s;
        });
    }

    const LengthHandler = (value) => {
        setLength(value);
        if (selected > value) {
            setSelected(value - 1);
        }
    }

    const SelectedHandler = (title) => {
        setIsSelected(false);
        setSelected(0);
        setFocus(false);
        setQuery(title.name);
        onDropdownClick(title);
    }

    /**
     * @param {KeyboardEvent} e 
     */
    const KeyDownHandler = (e) => {
        e.preventDefault();
        
        switch (e.key) {
            case "ArrowUp":
                HandleArrowUp();
                break;
            
            case "ArrowDown":
                HandleArrowDown();
                break;
            
            case "Tab":
                setIsSelected(true);
                break;
            
            default:
                (onKeyDown || noop)();
                break;
        }
    }

    useEffect(() => {
        const input = inputRef.current;
        if (typeof input !== 'undefined') {
            input.onfocus = (e) => {
                if (!input.readOnly) {
                    setFocus(true);
                }

                setSelected(0);
            }

            input.onblur = (e) => {
                setSelected(0);
                // setFocus(false);
            }
        }
    }, []);

    return (
        <div className='dropdown-input-container'>
            <input ref={inputRef} readOnly={readOnly}
                value={query} onChange={InputHandler} onKeyDown={KeyDownHandler}
                autoComplete="off" type="text" id="title-input"
                placeholder='Ex.: Portal 2' name='title' />
            <SearchResults query={deferredQuery} selected={selected}
                focus={focus} setLength={LengthHandler} isSelected={isSelected}
                onDropdownClick={DropdownClickHandler} onSelected={SelectedHandler} />
        </div>
    )
}