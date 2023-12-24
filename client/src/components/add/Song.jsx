import { MusicNoteRounded } from '@mui/icons-material';
import Container from '../Container';
import TextInput from '../elements/TextInput';

export default function SongContainer({songName, setSongName, youtubeId, setYoutubeId}) {
    return (
        <>
            <Container.Header>
                <MusicNoteRounded style={{
                    backgroundColor: 'var(--text-color)',
                    color: 'var(--background-color)',
                    borderRadius: '2px',
                    fontSize: '18px',
                    top: '-2px',
                    position: 'relative'
                }} />
                <span>Song</span>
            </Container.Header>
            
            {/* <h3>Make sure to not add a copyrighted music/song since most of them block embeds.</h3> */}
            {/* <label htmlFor='input_name'>Name</label>
            <h3>Insert the name of the song here</h3>
            <input id='input_name' type='text' name='song_name'
                autoComplete="off" placeholder='Ex.: Never Gonna Give You Up' value={songName}
                onInput={(e) => setSongName(e.target.value)} /> */}
            
            <TextInput labelText='Name' helpText='Enter the song name here.' id='songname-input'
                autoComplete='off' placeholder='Never Gonna Give You Up' value={songName}
                type='text' onInput={(e) => setSongName(e.target.value)}/>
            
            {/* <label htmlFor='input_youtube_id'>Youtube ID</label>
            <h3>Insert the ID of the youtube video or video link</h3>
            <input id='input_youtube_id' type='text' name='youtube_id'
                autoComplete="off" placeholder='Ex.: dQw4w9WgXcQ' value={youtubeId}
                onInput={setYoutubeId} /> */}
            
            <TextInput labelText='Youtube ID' helpText='Enter the link or ID of the youtube video.'
                id='youtube-id-input' autoComplete='off' placeholder='dQw4w9WgXcQ' value={youtubeId}
                type='text' onInput={setYoutubeId} />
        </>
    );
}