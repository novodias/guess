import React, { useState } from "react";
import { wait, classFilter } from "../../utils";
import Spinner from '../Spinner';

function Button({ children, className, onClick, withLoading }) {
    const [loading, setLoading] = useState(false);

    const ClickHandler = async () => {
        if (!onClick) return;

        if (onClick instanceof Promise) {
            try {
                setLoading(true);
                await onClick();
            } catch (e) { 
                console.error(e);
            } finally {
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                onClick();
            } catch (error) {
                console.error(e);
            } finally {
                wait(2000).then(() => setLoading(false));
            }
        }
    }
    
    return (
        <button className={"btn" + classFilter(className)} onClick={ClickHandler}>
            {loading && withLoading ? <Spinner /> : null}
            {children}
        </button>
    )
}

Button.Secondary = ({ className, children, onClick, withLoading }) => {
    return (
        <Button className={"secondary" + classFilter(className)}
            onClick={onClick} withLoading={withLoading}>
            {children}
        </Button>
    )
}

Button.Group = ({ children }) => {
    return (
        <div className="buttons-group">
            {children}
        </div>
    )
}

export default Button;