export default () => {
    /**
     * @type {OffscreenCanvas | null}
     */
    let canvas = null;
    /**
     * @type {OffscreenCanvasRenderingContext2D | null}
     */
    let ctx = null;
    let canvasHeight = null;

    const draw = ({ bufferLength, dataArray }) => {
        let barHeightTop, barHeightBelow;
        const barWidth = (canvas.width / bufferLength) * 3;
        let currentBar = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < bufferLength; i++) {
            barHeightTop = dataArray[i];
            barHeightBelow = barHeightTop * -1;
            ctx.fillRect(currentBar, canvasHeight - barHeightTop, barWidth, barHeightTop);
            ctx.fillRect(currentBar, canvasHeight - barHeightBelow, barWidth, barHeightBelow);
            currentBar += barWidth * 1.2;
        }
    };

    onmessage = function (e) {
        const { bufferLength, dataArray, canvas: canvasMessage } = e.data;
        if (canvasMessage) {
            canvas = canvasMessage;
            canvasHeight = canvas.height / 2;
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