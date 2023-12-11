import { useState } from "react";
import { MD5 } from 'crypto-js';


export default function usePassword() {
    const [value, set] = useState('');

    function hashed() {
        if (!value || value === "") {
            return null;
        }
        
        return MD5(value).toString();
    }

    return { value, set, hashed };
}