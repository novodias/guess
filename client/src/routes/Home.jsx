import '../styles/pages/home.css';
import React from 'react';
import Join from '../components/home/Join';
import Options from '../components/home/Options';
import Create from '../components/home/Create';

export default function Home() {
    return (
        <div className="row">
            <Options />
            <div className='home container'>
                <Join />
                <Create />
            </div>
        </div>
    );
}