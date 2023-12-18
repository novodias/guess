import React from 'react';
import InputTitles from '../InputTitles';
import { MovieRounded } from '@mui/icons-material';
import Container from '../Container';

const types = ['Animes', 'Games', 'Movies', 'Series', 'Musics'];

export default function TitleContainer({ id, type, setTag, onDropdownClick, setSearchQuery }) {    
    return (
        <Container className={'col'} 
            header={(<><MovieRounded /> Select a title</>)}>
            <h3>If not found, the title will be created with the song.</h3>
            <div className='titles-form'>
                <input readOnly value={id} type='text' name='title_id' />
                <select required name='type' value={type}
                    onChange={setTag}>
                    {types.map((type, key) => {
                        return <option key={key} value={type}>{type}</option>
                    })}
                </select>
                <div className='title-wrapper'>
                    <InputTitles onDropdownClick={onDropdownClick}
                        readOnly={false} onText={setSearchQuery} />
                </div>
            </div>
        </Container>
    );
}