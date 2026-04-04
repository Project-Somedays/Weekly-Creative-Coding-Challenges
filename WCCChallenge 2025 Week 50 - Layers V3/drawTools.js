const drawLeafButton = () => {
    document.getElementById('canvasContainer').style.display = 'block';
    canvasVisible = true;
    controls.enabled = false; // Disable orbit controls while drawing
};

const clearDesign = () => {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
};

const confirmLeafDesign = () => {
    document.getElementById('canvasContainer').style.display = 'none';
    canvasVisible = false;
    controls.enabled = true; // Re-enable orbit controls
    
    // This is where you'll create the texture - we'll do this next!
    leafTexture = createLeafTexture();
    console.log("Canvas hidden, ready to create texture!");
};

// Update your createLeafTexture function to call this:
function createLeafTexture() {
    const texture = new THREE.CanvasTexture(drawingCanvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    console.log("Texture created!", texture);
    
    // Apply texture to leaves
    populateTreeWithLeaves(texture);
    
    return texture;
}

function setupDrawingCanvas() {
    drawingCanvas = document.getElementById('drawingCanvas');
    cursorCanvas = document.getElementById('cursorCanvas');
    
    drawingCanvas.width = 512;
    drawingCanvas.height = 512;
    cursorCanvas.width = 512;
    cursorCanvas.height = 512;
    
    drawingCtx = drawingCanvas.getContext('2d');
    cursorCtx = cursorCanvas.getContext('2d');
    
    // Set up drawing context defaults
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';
    
    // Add event listeners for drawing (on the drawing canvas)
    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', (e) => {
        updateCursor(e);
        draw(e);
    });
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', (e) => {
        hideCursor();
        stopDrawing();
    });
    
    // Touch support
    drawingCanvas.addEventListener('touchstart', handleTouchStart);
    drawingCanvas.addEventListener('touchmove', handleTouchMove);
    drawingCanvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawingCtx.lineWidth = brushTools.brushPixelSize;
    
    if (brushTools.eraseMode) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        drawingCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        const color = new THREE.Color(brushTools.strokeColour);
        drawingCtx.strokeStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
        
        // Track this color if it's new
        addColorToHistory(brushTools.strokeColour);
    }
    
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
}

function updateCursor(e) {
    const rect = cursorCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clear the cursor canvas
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    
    // Draw cursor circle
    cursorCtx.beginPath();
    cursorCtx.arc(x, y, brushTools.brushPixelSize / 2, 0, Math.PI * 2);
    cursorCtx.strokeStyle = brushTools.eraseMode ? '#ff0000' : '#000000';
    cursorCtx.lineWidth = 1;
    cursorCtx.stroke();
}

function hideCursor() {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
}

function drawBrushCursor(x, y) {
    // Save the current canvas state
    const imageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    // Draw cursor circle
    drawingCtx.save();
    drawingCtx.globalCompositeOperation = 'source-over';
    drawingCtx.beginPath();
    drawingCtx.arc(x, y, brushTools.brushPixelSize / 2, 0, Math.PI * 2);
    drawingCtx.strokeStyle = brushTools.eraseMode ? '#ff0000' : '#000000';
    drawingCtx.lineWidth = 1;
    drawingCtx.stroke();
    drawingCtx.restore();
    
    // Restore the canvas after a brief moment to remove the cursor
    requestAnimationFrame(() => {
        drawingCtx.putImageData(imageData, 0, 0);
    });
}

function stopDrawing() {
    isDrawing = false;
    drawingCtx.beginPath();
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    drawingCanvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    drawingCanvas.dispatchEvent(mouseEvent);
}

