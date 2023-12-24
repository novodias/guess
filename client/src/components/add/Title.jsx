import React from 'react';
import InputTitles from '../InputTitles';
import { MovieRounded } from '@mui/icons-material';
import Container from '../Container';

const types = ['Animes', 'Games', 'Movies', 'Series', 'Musics'];

export default function TitleContainer({ id, type, setTag, onDropdownClick, setSearchQuery }) {    
    return (
        <>
            <Container.Header>
                <MovieRounded />
                <span>Title</span>
                <p className='help'>If not found, the title will be created with the song.</p>
            </Container.Header>
            <div className='titles-form'>
                <div className='row'>
                    <span id='title-id'>ID: {id}</span>
                    <select required name='type' value={type}
                        onChange={setTag}>
                        {types.map((type, key) => {
                            return <option key={key} value={type}>{type}</option>
                        })}
                    </select>
                </div>
                <div className='title-wrapper'>
                    <InputTitles onDropdownClick={onDropdownClick}
                        readOnly={false} onText={setSearchQuery} />
                </div>
            </div>
        </>
    );
}