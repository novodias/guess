import React, { useState, useEffect } from 'react';
import './Add.css';
import Dropdown from '../components/Dropdown';
import Alert from '../components/Alert';
import { MovieRounded, MusicNoteRounded } from '@mui/icons-material';

export default function AddPage() {

    const types = ['Animes', 'Games', 'Movies', 'Series', 'Musics'];

    const [titles, setTitles] = useState([]);

    const [title, setTitle] = useState('');
    const [titleId, setTitleId] = useState(0);
    const [titleType, setTitleType] = useState('Animes');

    const [songName, setSongName] = useState('');
    const [youtubeId, setYoutubeId] = useState('');

    const [titleFocus, setTitleFocus] = useState('');

    const [success, setSuccess] = useState(null);

    const getTitlesAsync = async (name, type) => {
        console.log("Fetching titles...");
        try {
            const response = await fetch(`/api/titles?name=${name || ''}${(name && type) ? '&type=' + type : ''}`);
            const data = await response.json();
            setTitles(data);
        } catch (error) {
            
        }
    }

    useEffect(() => {
        getTitlesAsync();
    }, []);

    // element select doesn't change here
    function _onDropdownClick({id, title, type}) {
        setTitle(title);
        setTitleId(id);
        setTitleType(type);
        setTitleFocus('');
    }

    const _onTitleInput = (event) => {
        const text = event.target.value;
        let dontSet = false;

        // find any title name that matches with text
        const found = titles.find(val => val.title.toLowerCase()
            .startsWith(text.toLowerCase())
        );

        // not found
        if (!found) {
            setTitleId(0);
        // found
        } else {
            // if text equals to found, set
            if (text.toLowerCase() === found.title.toLowerCase()) {
                setTitle(found.title);
                setTitleType(found.type);
                setTitleId(found.id);
                dontSet = true;
            }
        }
        
        // if titles is empty, fetch more
        if (titles.length === 0) {

            if (title.length !== text.length) {
                getTitlesAsync(null, null);
            }

            setTitle(text);
            return;
        }

        // if input is not empty, focus
        if (text.length > 0) {
            setTitleFocus('title-input-focused');

            // if not found with text, get more
            if (!found) {
                getTitlesAsync(text, null);
            }
        } else {
            setTitleId(0);
            setTitleFocus('');
        }
        
        if (!dontSet) {
            setTitle(text);
        }
    }

    function _onTitleFocusIn() {
        setTitleFocus('title-input-focused');
    }

    function _onTitleFocusOut() {
        if (title || title !== '') {
            return;
        }

        setTitleFocus('');
    }

    function _onInputYoutubeId(e) {
        const text = e.target.value;
        if (text.includes('v=')) {
            let video_id = text.split('v=')[1];
            const ampersandPosition = video_id.indexOf('&');
            if(ampersandPosition !== -1) {
                video_id = video_id.substring(0, ampersandPosition);
            }
            setYoutubeId(video_id);
        } else {
            setYoutubeId(text);
        }
    }

    /**
     * 
     * @param {SubmitEvent} e 
     */
    const _onFormSubmit = async (e) => {
        e.preventDefault();

        /**
         * 
         * @param {Response} response 
         */
        const verifyError = (response) => {
            if (response.status.toString().startsWith('4')) {
                return true;
            }

            return false;
        }

        try {
            const response = await fetch(`/api/create`, {
                method: 'POST',
                mode: 'cors',
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title_id: titleId,
                    title: title,
                    type: titleType,
                    song_name: songName,
                    youtube_id: youtubeId
                }),
            });

            if (verifyError(response)) {
                throw new Error(await response.text());
            }

            setSuccess({type: 'success', message: "The song was successfully created!"})
        } catch (error) {
            console.error(error);

            if (error instanceof TypeError) {
                setSuccess({ type: 'danger', message: "Server API offline" });
            } else {
                setSuccess({ type: 'danger', message: error.message });
            }
        } finally {
            setTimeout(() => setSuccess(null), 1000 * 10);
            setTitleId(0);
            setTitle('');
            setSongName('');
            setYoutubeId('');
        }
    }

    function TitleContainer() {
        return (
            <div className='container forms-container titles-container'>
                <h2><MovieRounded /> Select a title</h2>
                <h3>If not found, the title will be created with the song.</h3>

                <div className='titles-form'>
                    <input readOnly value={titleId} type='text' name='title_id' />
                    <select required name='type' value={titleType}
                        onChange={(e) => { setTitleType(e.target.value); console.log(e.target.value) }}>
                        {types.map((type, key) => {
                            return <option key={key} value={type}>{type}</option>
                        })}
                    </select>
                    <div className='title-wrapper'>
                        <input value={title} onInput={_onTitleInput}
                            onFocus={_onTitleFocusIn} onBlur={_onTitleFocusOut}
                            autoComplete="off" type="text" id="title-input"
                            placeholder='Ex.: Portal 2' name='title' />
                        <Dropdown className={titleFocus}>
                            {titles
                                .filter(val => val.title.toLowerCase().startsWith(title.toLowerCase()))
                                .map((title, key) => {
                                return (
                                    <li onClick={() => _onDropdownClick(title)} key={key} id={title.id}>
                                        {title.title}
                                    </li>
                                )
                            })}
                        </Dropdown>
                    </div>
                </div>
            </div>
        );
    }

    function SongContainer() {
        return (
            <div className='container forms-container songs-container'>
                <h2><MusicNoteRounded /> Add a new song</h2>
                <h3>Make sure to not add a copyrighted music/song since most of them block embeds.</h3>

                <label htmlFor='input_name'>Name</label>
                <h3>Insert the name of the song here</h3>
                <input id='input_name' type='text' name='song_name'
                    autoComplete="off" placeholder='Ex.: Never Gonna Give You Up' value={songName}
                    onInput={(e) => setSongName(e.target.value)} />
                
                <label htmlFor='input_youtube_id'>Youtube ID</label>
                <h3>Insert the ID of the youtube video or video link</h3>
                <input id='input_youtube_id' type='text' name='youtube_id'
                    autoComplete="off" placeholder='Ex.: dQw4w9WgXcQ' value={youtubeId}
                    onInput={_onInputYoutubeId} />
                <button className='btn'>Send</button>
            </div>
        );
    }

    return (
        <div>
            <form onSubmit={_onFormSubmit}>
                <div id='create-container'>
                    <TitleContainer />
                    <SongContainer />
                    {success && <Alert message={success.message} type={success.type} />}
                </div>
            </form>
        </div>
    );
}