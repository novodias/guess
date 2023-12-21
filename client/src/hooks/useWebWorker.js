import { useMemo } from "react";

function WebWorker(worker) {
    const code = worker.toString();
    const blob = new Blob(['(' + code + ')()']);
    return new Worker(URL.createObjectURL(blob));
}

export default function useWebWorker(path) {
    return useMemo(() => WebWorker(path), []);
}