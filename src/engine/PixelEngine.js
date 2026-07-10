export class PixelEngine {
  constructor(canvasElement, width = 32, height = 32) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.width = width;
    this.height = height;
    
    // Set actual canvas size (internal resolution)
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // State
    this.tool = 'pencil'; // pencil, eraser, fill, eyedropper
    this.color = '#000000';
    this.brushSize = 1;
    this.isDrawing = false;
    
    // History & Time-lapse
    this.undoStack = [];
    this.redoStack = [];
    this.actionHistory = []; // For time-lapse replay
    this.currentStroke = null;
    
    // Disable anti-aliasing
    this.ctx.imageSmoothingEnabled = false;
    
    // Save initial blank state
    this.saveState();
  }

  setTool(tool) {
    this.tool = tool;
  }

  setColor(color) {
    this.color = color;
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  // Used to notify UI when eyedropper picks a color
  onColorPicked(callback) {
    this.colorPickedCallback = callback;
  }

  // Get exact pixel coordinates from pointer event
  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    return { x, y };
  }

  onPointerDown(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoords(e);
    
    if (this.tool === 'fill') {
      this.actionHistory.push({ type: 'fill', color: this.color, x, y });
      this.floodFill(x, y);
      this.saveState();
      this.isDrawing = false;
    } else if (this.tool === 'eyedropper') {
      this.pickColor(x, y);
      this.isDrawing = false;
    } else {
      this.currentStroke = { type: this.tool, color: this.color, size: this.brushSize, points: [] };
      this.draw(x, y);
    }
  }

  onPointerMove(e) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoords(e);
    this.draw(x, y);
  }

  onPointerUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
      if (this.currentStroke && this.currentStroke.points.length > 0) {
        this.actionHistory.push(this.currentStroke);
      }
      this.currentStroke = null;
      this.saveState();
    }
  }

  draw(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;

    if (this.currentStroke) {
      // Avoid duplicate points in history
      const lastPoint = this.currentStroke.points[this.currentStroke.points.length - 1];
      if (!lastPoint || lastPoint[0] !== x || lastPoint[1] !== y) {
        this.currentStroke.points.push([x, y]);
      }
    }

    const offset = Math.floor(this.brushSize / 2);
    const startX = this.brushSize === 1 ? x : x - offset;
    const startY = this.brushSize === 1 ? y : y - offset;

    if (this.tool === 'pencil') {
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(startX, startY, this.brushSize, this.brushSize);
    } else if (this.tool === 'eraser') {
      this.ctx.clearRect(startX, startY, this.brushSize, this.brushSize);
    }
  }

  pickColor(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const pixel = this.ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) { // If not transparent
      const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase();
      this.setColor(hex);
      if (this.colorPickedCallback) this.colorPickedCallback(hex);
    }
  }

  // Utility to convert hex color to RGBA array
  hexToRgba(hex) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c = hex.substring(1).split('');
      if(c.length === 3){
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return [(c>>16)&255, (c>>8)&255, c&255, 255];
    }
    return [0, 0, 0, 255]; // fallback
  }

  // Simple flood fill algorithm
  floodFill(startX, startY) {
    if (startX < 0 || startY < 0 || startX >= this.width || startY >= this.height) return;

    const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;
    const targetColor = this.hexToRgba(this.color);
    
    const startPos = (startY * this.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // If starting pixel is already target color, do nothing
    if (startR === targetColor[0] && startG === targetColor[1] && 
        startB === targetColor[2] && startA === targetColor[3]) {
      return;
    }

    const matchStartColor = (pos) => {
      return data[pos] === startR && data[pos + 1] === startG && 
             data[pos + 2] === startB && data[pos + 3] === startA;
    };

    const colorPixel = (pos) => {
      data[pos] = targetColor[0];
      data[pos + 1] = targetColor[1];
      data[pos + 2] = targetColor[2];
      data[pos + 3] = targetColor[3];
    };

    const pixelStack = [[startX, startY]];

    while (pixelStack.length > 0) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * this.width + x) * 4;
      
      while (y-- >= 0 && matchStartColor(pixelPos)) {
        pixelPos -= this.width * 4;
      }
      pixelPos += this.width * 4;
      ++y;

      let reachLeft = false;
      let reachRight = false;

      while (y++ < this.height - 1 && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);

        if (x > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < this.width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        pixelPos += this.width * 4;
      }
    }
    
    this.ctx.putImageData(imgData, 0, 0);
  }

  saveState() {
    const data = this.canvas.toDataURL();
    // Don't save if it's the same as the last state
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === data) {
      return;
    }
    this.undoStack.push(data);
    this.redoStack = []; // Clear redo stack on new action
    
    // Autosave to localStorage
    try {
      localStorage.setItem('pixelia_autosave', JSON.stringify({
        dataUrl: data,
        history: this.actionHistory,
        width: this.width,
        height: this.height
      }));
    } catch (e) {
      console.error('Autosave failed:', e);
    }
  }

  undo() {
    if (this.undoStack.length > 1) {
      const currentState = this.undoStack.pop();
      this.redoStack.push(currentState);
      const prevState = this.undoStack[this.undoStack.length - 1];
      this._loadImageData(prevState);
    } else if (this.undoStack.length === 1) {
      // Allow undoing down to empty canvas, but keep the empty state in stack
      const currentState = this.undoStack.pop();
      this.redoStack.push(currentState);
      this.clear(false); // clear without saving state
      this.undoStack.push(this.canvas.toDataURL());
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.undoStack.push(nextState);
      this._loadImageData(nextState);
    }
  }

  _loadImageData(dataUrl) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.drawImage(img, 0, 0);
    };
  }

  clear(save = true) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (save) {
      this.actionHistory.push({ type: 'clear' });
      this.saveState();
    }
  }

  exportPNG() {
    const dataUrl = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pixelia-artwork-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Draw a 2D array of colors (used for AI Magic Wand)
  drawPixelGrid(pixels) {
    if (!pixels || !Array.isArray(pixels)) return;
    
    const gridHeight = pixels.length;
    if (gridHeight === 0) return;
    const gridWidth = pixels[0].length;
    
    // Calculate scale factor to fill canvas
    const scaleX = Math.floor(this.width / gridWidth);
    const scaleY = Math.floor(this.height / gridHeight);
    
    // Draw each pixel, scaled up
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const color = pixels[y][x];
        if (color && color !== 'transparent') {
          this.ctx.fillStyle = color;
          // Draw a scaled block
          this.ctx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
        }
      }
    }
    this.actionHistory.push({ type: 'magic_wand', pixels: pixels });
    this.saveState();
  }

  // --- Time-Lapse Replay ---
  async playHistory(historyArray, onComplete) {
    if (!historyArray || historyArray.length === 0) return;
    
    // Clear canvas without recording to history
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const action of historyArray) {
      if (action.type === 'clear') {
        this.ctx.clearRect(0, 0, this.width, this.height);
        await delay(50);
      } 
      else if (action.type === 'fill') {
        const oldColor = this.color;
        this.color = action.color;
        this.floodFill(action.x, action.y);
        this.color = oldColor;
        await delay(50);
      }
      else if (action.type === 'magic_wand') {
        this.drawPixelGrid(action.pixels);
        await delay(100);
      }
      else if (action.type === 'pencil' || action.type === 'eraser') {
        const offset = Math.floor(action.size / 2);
        
        for (const [x, y] of action.points) {
          const startX = action.size === 1 ? x : x - offset;
          const startY = action.size === 1 ? y : y - offset;
          
          if (action.type === 'pencil') {
            this.ctx.fillStyle = action.color;
            this.ctx.fillRect(startX, startY, action.size, action.size);
          } else {
            this.ctx.clearRect(startX, startY, action.size, action.size);
          }
          // tiny delay for stroke animation
          await delay(5);
        }
        await delay(20);
      }
    }
    
    if (onComplete) onComplete();
  }
}
