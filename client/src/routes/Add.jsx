import './Add.css';
import React, { useState } from 'react';
import Alert from '../components/Alert';
import TagsContainer from '../components/add/Tags'
import TitleContainer from '../components/add/Title'
import SongContainer from '../components/add/Song'

export default function AddPage() {
    const [id, setId] = useState(0);
    const [name, setName] = useState('');
    const [type, setType] = useState('Animes');
    const [tags, setTags] = useState([]);

    const [songName, setSongName] = useState('');
    const [youtubeId, setYoutubeId] = useState('');
    const [success, setSuccess] = useState(null);

    const _onDropdownClick = ({ id, type, name, tags }) => {
        setId(id);
        setName(name);
        setType(type);
        setTags(tags || []);
    }

    function matchYoutubeId(e) {
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
            const status = response.status.toString();
            if (status.startsWith('4') || status.startsWith('5')) {
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
                    title_id: id,
                    title_name: name,
                    title_type: type,
                    title_tags: tags,
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
            setId(0);
            setName('');
            setType('Animes');
            setTags([]);
        }
    }

    const setTag = (e) => {
        setId(0);
        setType(e.target.value);
        setTags([]);
    }

    const setSearchQuery = (text) => {
        setId(0);
        setName(text);
        setType('Animes');
        setTags([]);
    }

    return (
        <div>
            <form onSubmit={_onFormSubmit}>
                <div id='create-container'>
                    <TitleContainer id={id} onDropdownClick={_onDropdownClick}
                        setSearchQuery={setSearchQuery} setTag={setTag}
                        type={type} />
                    <TagsContainer tagsFound={tags || []} />
                    <SongContainer songName={songName} youtubeId={youtubeId}
                        setSongName={setSongName} setYoutubeId={matchYoutubeId} />
                    {success && <Alert message={success.message} type={success.type} />}
                </div>
            </form>
        </div>
    );
}