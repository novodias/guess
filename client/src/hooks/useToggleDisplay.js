import { useLayoutEffect, useRef } from "react";

/**
 * @param {import("react").MutableRefObject<HTMLElement>} refElement
 * @param {boolean} hidden 
 */
export default function useToggleDisplay(refElement, hidden) {
    const ref = useRef(() => {
        const el = refElement.current;
        if (!el) return;

        const isVisible = el.classList.contains('show');
        
        if (isVisible) {
            el.classList.remove('show');
            el.classList.add('hide');
        } else {
            el.classList.remove('hide');
            el.classList.add('show');
        }
    });
    
    useLayoutEffect(() => {
        const el = refElement.current;
        
        if (el) {
            if (hidden) {
                el.classList.remove('show');
                el.classList.add('hide');
            } else {
                el.classList.remove('hide');
                el.classList.add('show');
            }
        }
    }, []);

    return ref.current;
}