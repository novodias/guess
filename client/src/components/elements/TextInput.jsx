import React from 'react';

/**
 * @param {Object} props 
 * @param {string} props.id 
 * @param {string} props.labelText 
 * @param {string} props.helpText 
 * @param {string} props.value 
 * @param {function(string)} props.onInput 
 * @param {function()} props.onEnter 
 * @param {string} props.placeholder 
 * @param {("on"|"off")} props.autoComplete 
 * @param {("text"|"password")} props.type
 */
export default function TextInput({ id, labelText, helpText, value, onInput, onEnter, placeholder, autoComplete, type }) {
    /**
     * @param {React.FormEvent} e 
     */
    function _onInput(e) {
        if (!onInput) return;
        onInput(e.target.value);
    }

    /**
     * @param {React.KeyboardEvent} e 
     */
    function onKeyUp(e) {
        if (!onEnter) return;
        if (e.key === 'Enter' || e.keyCode === 13) {
            onEnter();
        }
    }
    
    return (
        <>
            <label htmlFor={id}>{labelText}</label>
            <h3>{helpText}</h3>
            <input id={id} type={type || "text"} placeholder={placeholder} autoComplete={autoComplete}
                value={value} onInput={_onInput} onKeyUp={onKeyUp} />
        </>
    )
}