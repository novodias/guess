import React from 'react';

export default function Difficulty({ value, difficultyColor }) {

    const style = { backgroundColor: difficultyColor || null };

    return (
        <div className='difficulty-container row'>
            <h2>DIFFICULTY</h2><span style={style}>{value}</span>
        </div>
    )
}