// eslint-disable-next-line no-unused-vars
import React, { useRef, MutableRefObject } from "react";
import './Modal.css';
import { CloseRounded } from '@mui/icons-material'

function Modal({ className, children }) {
    /**
     * @type {MutableRefObject<HTMLSpanElement>}
     */
    const modalRef = useRef(undefined);
    const close = () => {
        modalRef.current.remove();
    }

    return (
        <div className={`modal${(' ' + className || '')}`} ref={modalRef}>
            <span className="modal-close" onClick={close}>
                <CloseRounded />
            </span>
            {children}
        </div>
    )
}

function Header({ text }) {
    return (
        <div className="modal-header">
            <h1>{text}</h1>
        </div>
    )
}

function Body({ children }) {
    return (
        <div className="modal-body">
            {children}
        </div>
    )
}

Modal.Header = Header;
Modal.Body = Body;

export default Modal;