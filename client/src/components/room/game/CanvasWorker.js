export default () => {
    /**
     * @type {OffscreenCanvas | null}
     */
    let canvas = null;
    /**
     * @type {OffscreenCanvasRenderingContext2D | null}
     */
    let ctx = null;

    const draw = ({ bufferLength, dataArray }) => {
        let barHeight;
        const barWidth = (canvas.width / bufferLength) * 3;
        let currentBar = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 2;
            ctx.fillRect(currentBar, canvas.height - barHeight, barWidth, barHeight);
            currentBar += barWidth * 1.2;
        }
    };

    onmessage = function (e) {
        const { bufferLength, dataArray, canvas: canvasMessage } = e.data;
        if (canvasMessage) {
            canvas = canvasMessage;
            ctx = canvas.getContext('2d');
            // ctx.fillStyle = `black`;
            ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
        } else {
            try {
                draw({ bufferLength, dataArray });
            } catch (e) {
                console.error(e);
            }
        }
    }
}