// import './Add.css';
import '../styles/pages/add.css';
import React, { useState } from 'react';
import TagsContainer from '../components/add/Tags'
import TitleContainer from '../components/add/Title'
import SongContainer from '../components/add/Song'
import { createAsync } from '../api/export';
import { NotificationBuilder, useNotificationDispatchContext } from '../context/NotificationProvider';
import Button from '../components/elements/Button';

export default function AddPage() {
    const [id, setId] = useState(0);
    const [name, setName] = useState('');
    const [type, setType] = useState('Animes');
    const [tags, setTags] = useState([]);

    const [songName, setSongName] = useState('');
    const [youtubeId, setYoutubeId] = useState('');
    const { pushNotification } = useNotificationDispatchContext();

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
    const FormSubmitHandler = async (e) => {
        e.preventDefault();

        /**
         * 
         * @param {import('axios').AxiosResponse} response 
         */
        const verifyError = (response) => {
            const status = response.status.toString();
            if (status.startsWith('4') || status.startsWith('5')) {
                return true;
            }
            return false;
        }

        let builder = NotificationBuilder().clickable();

        try {
            const response = await createAsync(
                { id, name, type, tags },
                songName, youtubeId
            );

            if (verifyError(response)) {
                throw new Error(response.statusText);
            }

            builder = builder.text("The song was successfully created.")
        } catch (error) {
            console.error(error);

            if (error instanceof TypeError) {
                builder = builder.text("API offline, try again later.")
            } else {
                const data = error.response.data;
                builder = builder.text(data.error.message);
            }
        } finally {
            pushNotification(builder.build());
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
        <form className='add-form container' onSubmit={FormSubmitHandler}>
            <TitleContainer id={id} onDropdownClick={_onDropdownClick}
                setSearchQuery={setSearchQuery} setTag={setTag}
                type={type} />
            <TagsContainer tags={tags} setTags={setTags} />
            <SongContainer songName={songName} youtubeId={youtubeId}
                setSongName={setSongName} setYoutubeId={matchYoutubeId} />
            <Button.Group>
                <Button className={'btn-green'} withLoading={true}>Send</Button>
            </Button.Group>
        </form>
    );
}