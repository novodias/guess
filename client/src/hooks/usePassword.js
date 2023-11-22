import { useState } from "react";
import { MD5 } from 'crypto-js';


export default function usePassword() {
    const [password, setPassword] = useState('');

    function hashed() {
        return MD5(password).toString();
    }

    return { password, setPassword, hashed };
}