import { MusicNoteRounded } from '@mui/icons-material';

export default function SongContainer({songName, setSongName, youtubeId, setYoutubeId}) {
    return (
        <div className='container col songs-container'>
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
                onInput={setYoutubeId} />
            <button className='btn'>Send</button>
        </div>
    );
}