class CanvasPainter {
    constructor({
                    defaultColor = 'rgba(255, 255, 255, 1)',
                    strokeWidth = 20,
                    canvasId = 'drawingArea',
                    colorPaletteClass = '.button'
                } = {}) {
        this.colorPalette = document.querySelectorAll(colorPaletteClass);
        this.currentColor = defaultColor;
        this.strokeWidth = strokeWidth;
        this.drawingActive = false;
        this.prevX = 0;
        this.prevY = 0;
        this.eraseMode = false;
        this.history = [];

        this.drawingCanvas = document.getElementById(canvasId);
        this.ctx = this.drawingCanvas.getContext('2d');

        this.setup();
    }

    setup() {
        const initialColorButton = document.getElementById('deafultColor');
        this.currentColor = getComputedStyle(initialColorButton).backgroundColor;
        this.setColorToPanelHeading(this.currentColor, initialColorButton.textContent);
        initialColorButton.classList.add('is-focused');
        this.colorPalette.forEach(color => {
            color.addEventListener('click', (event) => this.selectColor(event));
        });

        this.drawingCanvas.addEventListener('mousedown', (event) => this.startPaint(event));
        this.drawingCanvas.addEventListener('mousemove', (event) => this.paint(event));
        this.drawingCanvas.addEventListener('mouseup', () => this.endPaint());
        this.drawingCanvas.addEventListener('mouseout', () => this.endPaint());

        document.getElementById('brushWidth').addEventListener('input', (event) => {
            this.strokeWidth = event.target.value;
        });

        const eraseButton = document.getElementById('eraseButton');
        eraseButton.addEventListener('click', () => {
            this.toggleErase(eraseButton);
        });

        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'z') {
                this.undoLastStroke();
            }
        });
    }

    toggleErase(eraseButton) {
        this.eraseMode = !this.eraseMode;
        eraseButton.classList.toggle('is-focused', this.eraseMode);
    }

    selectColor(event) {
        this.eraseMode = false;
        const eraseButton = document.getElementById('eraseButton');
        eraseButton.classList.remove('is-focused');

        this.currentColor = getComputedStyle(event.target).backgroundColor;

        this.colorPalette.forEach(color => {
            color.classList.remove('is-focused');
        });
        event.target.classList.add('is-focused');
        this.setColorToPanelHeading(this.currentColor, event.target.textContent);
    }

    setColorToPanelHeading(color, text) {
        const elem = document.getElementById('panelHeading');
        const firstArr = ['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)'];

        elem.style.backgroundColor = color;
        elem.textContent = firstArr.includes(color) ? 'Стереть' : text;
        elem.style.color = ['rgb(235, 255, 252)', 'rgb(107, 255, 233)', ...firstArr].includes(`${color}`) ? 'black' : "white";
    }

    startPaint(event) {
        this.drawingActive = true;
        this.saveState();
        [this.prevX, this.prevY] = [event.offsetX, event.offsetY];
    }

    endPaint() {
        this.drawingActive = false;
        this.ctx.beginPath();
    }

    paint(event) {
        if (!this.drawingActive) return;

        this.ctx.strokeStyle = this.eraseMode ? '#FFFFFF' : this.currentColor;
        this.ctx.lineWidth = this.eraseMode ? this.strokeWidth * 2 : this.strokeWidth;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(event.offsetX, event.offsetY);
        this.ctx.stroke();
        [this.prevX, this.prevY] = [event.offsetX, event.offsetY];
    }

    saveState() {
        const currentImage = this.ctx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.history.push(currentImage);
    }

    undoLastStroke() {
        if (this.history.length > 0) {
            const lastState = this.history.pop();
            this.ctx.putImageData(lastState, 0, 0);
        }
    }
}
const myPainter = new CanvasPainter({
    defaultColor: getComputedStyle(document.getElementById('deafultColor')).backgroundColor,
    strokeWidth: 20
});
