import { useState } from "react";
import { MD5 } from 'crypto-js';


export default function usePassword() {
    const [password, setPassword] = useState('');

    function hashed() {
        if (!password || password === "") {
            return null;
        }
        
        return MD5(password).toString();
    }

    return { password, setPassword, hashed };
}