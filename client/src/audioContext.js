export default class AudioVisualizerContext {
    constructor() {
        // if (audio) {
        //     this.context = new window.AudioContext();
        //     this.source = this.context.createMediaElementSource(audio);
        //     this.analyser = this.context.createAnalyser();
        //     this.source.connect(this.analyser);
        //     this.analyser.connect(this.context.destination);
        //     this.analyser.fftSize = 128;
        // }
    }

    create(audio) {
        if (!audio) {
            console.log("audio is undefined");
        }

        this.context = new window.AudioContext();
        this.source = this.context.createMediaElementSource(audio);
        this.analyser = this.context.createAnalyser();
        this.source.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.analyser.fftSize = 128;
    }

    getData() {
        if (typeof this.analyser === 'undefined') return;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        return { bufferLength, dataArray };
    }

    getByteFrequencyData(array) {
        if (typeof this.analyser === 'undefined') return;
        this.analyser.getByteFrequencyData(array);
    }

    dispose() {
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }

        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }

        if (this.context) {
            this.context.close();
            this.context = null;
        }
    }
}