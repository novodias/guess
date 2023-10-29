import React from 'react';
import Container from '../components/Container';
import { usePopupDispatchContext } from '../context/PopupProvider';

export default function AudioPlayerTestPage() {
    const { add } = usePopupDispatchContext();

    const onClickAddPopup = (e) => {
        add({
            text: "This is a popup test",
            gap: 10,
            orient: "bottom",
            waitForClick: true,
            // hasButton: true,
            // buttonText: "Start",
            // onButtonClick: function () {
            //     alert("test");
            // }
        });
    }

    return (
        <Container isContent={false} headerText={"Popup"}>
            <button className="btn" onClick={onClickAddPopup}>
                Create popup
            </button>
        </Container>
    )
}