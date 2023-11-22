import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {boolean} props.checked 
 * @param {function(boolean)} props.onChecked 
 * @param {string} props.text
 * @param {React.CSSProperties} props.style
 */
export default function Checkbox({ id, checked, onChecked, text, style }) {
    /**
     * @param {React.ChangeEvent} e 
     */
    function onChange(e) {
        if (!onChecked) return;
        onChecked(e.target.checked);
    }

    const labelStyle = {
        margin: '0',
        flexGrow: '1'
    };

    return (
        <div className='row' style={style}>
            <input id={id} type='checkbox' checked={checked} onChange={onChange} />
            <label htmlFor={id} style={labelStyle}>{text}</label>
        </div>
    )
}