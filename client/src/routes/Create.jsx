import React, { useState } from 'react';
import './Create.css';
import Dropdown from '../layouts/Dropdown';
import Alert from '../layouts/Alert';

export default function CreatePage() {

    const types = ['Animes', 'Games', 'Movies', 'Series', 'Musics'];
    // const titles = [
    //     { id: 1, title: "Terraria", type: "Games" },
    //     { id: 2, title: "Dark Souls", type: "Games" },
    //     { id: 5, title: "Transformers", type: "Movies" }
    // ];

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
        const response = await fetch(`http://localhost:3001/api/titles?name=${name || ''}${(name && type) ? '&type=' + type : ''}`);
        const data = await response.json();
        setTitles(data);
    }

    // useEffect(() => {
    //     getTitlesAsync();
    // }, []);

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

        if (!found) {
            setTitleId(0);
        } else {
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
        // if (!title) return;
        
        // if (title === '') {
        //     return;
        // }

        setTitleFocus('title-input-focused');
    }

    function _onTitleFocusOut() {
        if (title || title !== '') {
            return;
        }

        setTitleFocus('');
    }

    /**
     * 
     * @param {SubmitEvent} e 
     */
    const _onFormSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:3001/api/create', {
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
        })
            .then(() => setSuccess('success'))
            .catch(() => setSuccess('danger'))
            .finally(() => setTimeout(() => setSuccess(null), 1000 * 10));
    }

    return (
        <div>
            <form onSubmit={_onFormSubmit}>
                {/* THIS IS FOR FETCH AND FILTER THE OPTIONS ON INPUT */}
                {/* TITLE */}
                <div id='container'>
                    <div className='titles-container'>
                        <select required name='type' defaultValue={titleType}
                            onChange={(e) => { setTitleType(e.target.value); console.log(e.target.value) }}>
                            {/* <option disabled selected>Type</option> */}
                            {types.map((type, key) => {
                                return <option key={key} value={type}>{type}</option>
                            })}
                        </select>
                        <input readOnly value={titleId} type='text' name='title_id' />
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

                    <div className='songs-container'>
                        <input id='input_name' type='text' name='song_name'
                            autoComplete="off" placeholder='Name' value={songName}
                            onInput={(e) => setSongName(e.target.value)} />
                        <input id='input_youtube_id' type='text' name='youtube_id'
                            autoComplete="off" placeholder='Youtube ID' value={youtubeId}
                            onInput={(e) => setYoutubeId(e.target.value)} />
                        <button className='btn'>Create</button>
                        {success && <Alert message={success === 'success' ?
                            "The song was successfully created!" : "Something went wrong."}
                            type={success} />}
                    </div>
                </div>
            </form>
        </div>
    );
}