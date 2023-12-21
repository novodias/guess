import React, { useRef, useState, useEffect, MutableRefObject, useLayoutEffect } from 'react';
import Spinner from '../Spinner';

/**
 * @param {React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>} props 
 */
export default function LazyImage(props) {
    /**
     * @type {MutableRefObject<HTMLImageElement>}
     */
    const ref = useRef(undefined);
    const [loaded, setLoaded] = useState(false);

    const LoadHandler = () => {
        setLoaded(true);        
    }

    useLayoutEffect(() => {
        const image = ref.current;
        if (image) {
            image.style.height = '0px';
            image.style.width = '0px';
            image.style.opacity = '0';
        }
    }, []);

    useEffect(() => {
        const image = ref.current;
        if (loaded) {
            image.style.width = '';
            image.style.height = '';
            image.style.opacity = '1';
            image.style.transition = 'opacity 200ms linear';
        }
    }, [loaded]);

    return (
        <>
            {!loaded ? <Spinner /> : null}
            <img ref={ref} {...props} loading='lazy' onLoad={LoadHandler}></img>
        </>
    )
}