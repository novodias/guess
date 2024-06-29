import React, { useEffect, useRef } from 'react';
import './Test.css';
import { AnimationNodeHelper } from '../animation';
import { useNotificationDispatchContext } from '../context/NotificationProvider';
import Container from '../components/Container';
import AudioPlayer from '../components/room/game/AudioPlayer';
import useToggleDisplay from '../hooks/useToggleDisplay';

export default function AudioPlayerTestPage() {
    /**
     * @type {import('react').MutableRefObject<HTMLDivElement>}
     */
    const divRef = useRef(undefined);
    const toggle = useToggleDisplay(divRef);

    // const { add } = useNotificationDispatchContext();

    // const onClickAddNotification = (e) => {
    //     add({
    //         text: "This is a notification test",
    //         gap: 10,
    //         orient: "bottom",
    //         waitForClick: true,
    //         // hasButton: true,
    //         // buttonText: "Start",
    //         // onButtonClick: function () {
    //         //     alert("test");
    //         // }
    //     });
    // }

    // useEffect(() => {
    //     const node = divRef.current;

    //     const { stop, pause, resume, reverse } = AnimationNodeHelper.move(
    //         node,
    //         { x: 0, y: 0 },
    //         { x: 500, y: 400 },
    //         2500,
    //         "easeInOut"
    //     );
        
    //     node.onclick = () => reverse();
    //     node.onmouseenter = () => {
    //         // console.log("onmouseenter");
    //         pause();
    //     }
    //     node.onmouseleave = () => resume();

    //     return () => {
    //         stop();
    //     }
    // }, []);
    
    // return (
    //     <div className='test' ref={divRef}>
    //         Animation Test
    //     </div>
    // )

    // const canvasRef = useRef(undefined);

    return (
        <div className='container test'>
            <div ref={divRef} className='container'>Test</div>
            <button className='btn' onClick={() => toggle()}>Toggle</button>
        </div>
        // <>
        //     <canvas ref={canvasRef} width={500} height={500}></canvas>
        //     <AudioPlayer play={true} src='/cdn/musics/minecraft/sweden' canvasRef={canvasRef} showAudioVisualizer={true} />
        // </>
        // <Container isContent={false} headerText={"Notification"}>
        //     <button className="btn" onClick={onClickAddNotification}>
        //         Create notification
        //     </button>
        // </Container>
    )
}