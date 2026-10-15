const assetPaths = {
    front: ["images/front_1.png", "images/front_2.png", "images/front_3.png"],
    side: ["images/side_1.png", "images/side_2.png", "images/side_3.png"],
    background: "images/background.png"
};

const state = {
    assetsReady: false,
    images: {
        front: [],
        side: [],
        background: null
    }
};

const els = {
    modeMessage: document.getElementById("modeMessage"),
    modeBinary: document.getElementById("modeBinary"),
    messageControls: document.getElementById("messageControls"),
    binaryControls: document.getElementById("binaryControls"),
    secretText: document.getElementById("secretText"),
    alphabet: document.getElementById("alphabet"),
    binary: document.getElementById("binary"),
    cols: document.getElementById("cols"),
    seed: document.getElementById("seed"),
    width: document.getElementById("width"),
    height: document.getElementById("height"),
    overlapX: document.getElementById("overlap_x"),
    overlapY: document.getElementById("overlap_y"),
    offset: document.getElementById("offset"),
    equalRows: document.getElementById("equalRows"),
    overlapXValue: document.getElementById("overlap_x_value"),
    overlapYValue: document.getElementById("overlap_y_value"),
    offsetValue: document.getElementById("offset_value"),
    bitCount: document.getElementById("bitCount"),
    rowCount: document.getElementById("rowCount"),
    canvasSize: document.getElementById("canvasSize"),
    generateBtn: document.getElementById("generateBtn"),
    copyBitsBtn: document.getElementById("copyBitsBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    errorBox: document.getElementById("errorBox"),
    canvas: document.getElementById("canvas")
};

function completeBitsForChar(ch) {
    const value = ch.charCodeAt(0) - 65;
    if (value < 0 || value > 25) return "";
    return value.toString(2).padStart(5, "0");
}

function originalBitsForChar(ch) {
    return originalBaconDictionary[ch.toLowerCase()] || "";
}

function getMessageBits() {
    const alphabet = els.alphabet.value;
    const normalized = els.secretText.value.toUpperCase();
    let bits = "";

    for (const ch of normalized) {
        if (/[A-Z]/.test(ch)) {
            bits += alphabet === "complete" ? completeBitsForChar(ch) : originalBitsForChar(ch);
        }
    }

    return bits;
}

function sanitizeBits(value) {
    return value.replace(/[^01]/g, "");
}

function currentBits() {
    if (els.modeMessage.checked) {
        const bits = getMessageBits();
        els.binary.value = bits;
        return bits;
    }
    const bits = sanitizeBits(els.binary.value);
    if (els.binary.value !== bits) {
        els.binary.value = bits;
    }
    return bits;
}

function rowCapacities(bitLength, cols, equalRows) {
    const rows = [];
    let remaining = bitLength;
    let fullRow = true;

    while (remaining > 0) {
        const capacity = equalRows || fullRow ? cols : cols - 1;
        rows.push(Math.min(remaining, capacity));
        remaining -= capacity;
        fullRow = !fullRow;
    }

    return rows;
}

function hashSeed(seed) {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function seededRandom(seed) {
    let value = hashSeed(seed || String(Date.now()));
    return function next() {
        value += 0x6D2B79F5;
        let t = value;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function showError(message) {
    els.errorBox.textContent = message;
    els.errorBox.style.display = message ? "block" : "none";
}

function readLayout() {
    return {
        cols: Number.parseInt(els.cols.value, 10),
        width: Number.parseInt(els.width.value, 10),
        height: Number.parseInt(els.height.value, 10),
        overlapX: Number.parseFloat(els.overlapX.value),
        overlapY: Number.parseFloat(els.overlapY.value),
        offset: Number.parseFloat(els.offset.value),
        equalRows: els.equalRows.checked
    };
}

function updateRangeLabels() {
    els.overlapXValue.textContent = Number.parseFloat(els.overlapX.value).toFixed(2);
    els.overlapYValue.textContent = Number.parseFloat(els.overlapY.value).toFixed(2);
    els.offsetValue.textContent = Number.parseFloat(els.offset.value).toFixed(2);
}

function updateMode() {
    const usingMessage = els.modeMessage.checked;
    els.messageControls.style.display = usingMessage ? "block" : "none";
    els.binaryControls.style.display = usingMessage ? "none" : "grid";
    els.binary.readOnly = false;
    els.binary.setAttribute("aria-readonly", "false");
    currentBits();
    updateStats();
}

function updateStats() {
    updateRangeLabels();
    const bits = currentBits();
    const layout = readLayout();
    const rows = rowCapacities(bits.length, layout.cols, layout.equalRows);
    const cellW = Math.max(1, Math.floor(layout.width * (1 - layout.overlapX)));
    const cellH = Math.max(1, Math.floor(layout.height * (1 - layout.overlapY)));
    const canvasWidth = (layout.cols + 1) * cellW;
    const canvasHeight = (rows.length + 1) * cellH;

    els.bitCount.textContent = String(bits.length);
    els.rowCount.textContent = String(rows.length);
    els.canvasSize.textContent = bits.length ? `${canvasWidth} x ${canvasHeight}` : "0 x 0";
}

function validate(bits, layout) {
    if (!state.assetsReady) {
        return "The included images are still loading.";
    }
    if (!bits) {
        return "Enter a secret message or a binary string before generating.";
    }
    if (!/^[01]+$/.test(bits)) {
        return "Binary input can only contain zeroes and ones.";
    }
    if (!Number.isInteger(layout.cols) || layout.cols < 3) {
        return "Column count must be at least 3.";
    }
    if (!Number.isFinite(layout.width) || !Number.isFinite(layout.height) || layout.width < 1 || layout.height < 1) {
        return "Figure width and height must be positive numbers.";
    }
    return "";
}

function generateImage() {
    const bits = currentBits();
    const layout = readLayout();
    const validationError = validate(bits, layout);
    updateStats();

    if (validationError) {
        showError(validationError);
        return;
    }
    showError("");

    const rows = rowCapacities(bits.length, layout.cols, layout.equalRows);
    const cellW = Math.max(1, Math.floor(layout.width * (1 - layout.overlapX)));
    const cellH = Math.max(1, Math.floor(layout.height * (1 - layout.overlapY)));
    const canvasWidth = (layout.cols + 1) * cellW;
    const canvasHeight = (rows.length + 1) * cellH;
    const rand = seededRandom(els.seed.value);

    const ctx = els.canvas.getContext("2d");
    els.canvas.width = canvasWidth;
    els.canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(state.images.background, 0, 0, canvasWidth, canvasHeight);

    let bitIndex = 0;
    for (let row = 0; row < rows.length; row += 1) {
        const rowCapacity = rows[row];
        const totalRowWidth = rowCapacity * cellW;
        const xOffset = Math.floor((canvasWidth - totalRowWidth) / 2) - Math.floor(layout.width / 3);
        const previousVariantByBit = { "0": -1, "1": -1 };

        for (let col = 0; col < rowCapacity; col += 1) {
            const bit = bits[bitIndex];
            bitIndex += 1;

            let x = xOffset + col * cellW;
            if (row % 2 === 1) {
                x += Math.floor(cellW * layout.offset);
            }
            const y = Math.floor(row * cellH) + 20;

            const variants = bit === "0" ? state.images.front : state.images.side;
            const chosenIndex = chooseVariantIndex(variants.length, previousVariantByBit[bit], rand);
            previousVariantByBit[bit] = chosenIndex;
            const chosen = variants[chosenIndex];
            ctx.drawImage(chosen, x, y, layout.width, layout.height);
        }
    }

    els.canvasSize.textContent = `${canvasWidth} x ${canvasHeight}`;
}

function chooseVariantIndex(variantCount, previousIndex, rand) {
    if (variantCount <= 1) return 0;

    let nextIndex = Math.floor(rand() * variantCount);
    if (nextIndex === previousIndex) {
        nextIndex = (nextIndex + 1 + Math.floor(rand() * (variantCount - 1))) % variantCount;
    }
    return nextIndex;
}

async function copyBits() {
    const bits = currentBits();
    updateStats();
    if (!bits) {
        showError("There are no bits to copy yet.");
        return;
    }
    try {
        await navigator.clipboard.writeText(bits);
        els.copyBitsBtn.textContent = "Copied";
        window.setTimeout(() => {
            els.copyBitsBtn.textContent = "Copy Bits";
        }, 1200);
    } catch (error) {
        els.binary.select();
        document.execCommand("copy");
    }
}

function downloadImage() {
    const link = document.createElement("a");
    link.download = "bacon_cipher_group_photo.png";
    link.href = els.canvas.toDataURL("image/png");
    link.click();
}

function bindEvents() {
    // Live stats (bit count, rows, canvas size) update on every keystroke/drag, but the
    // portrait itself only regenerates once a value is committed: "change" fires on blur
    // for text/number fields and on release (not while dragging) for range sliders, so
    // typing a message or dragging a slider stays smooth and doesn't redraw mid-edit.
    [
        els.secretText, els.alphabet, els.binary,
        els.cols, els.width, els.height, els.overlapX, els.overlapY, els.offset, els.equalRows, els.seed
    ].forEach((el) => {
        el.addEventListener("input", updateStats);
        el.addEventListener("change", generateImage);
    });

    els.modeMessage.addEventListener("change", () => {
        updateMode();
        generateImage();
    });
    els.modeBinary.addEventListener("change", () => {
        updateMode();
        generateImage();
    });
    els.generateBtn.addEventListener("click", generateImage);
    els.copyBitsBtn.addEventListener("click", copyBits);
    els.downloadBtn.addEventListener("click", downloadImage);
}

async function boot() {
    bindEvents();
    updateMode();

    try {
        const [frontImages, sideImages, background] = await Promise.all([
            Promise.all(assetPaths.front.map(loadImage)),
            Promise.all(assetPaths.side.map(loadImage)),
            loadImage(assetPaths.background)
        ]);
        state.images.front = frontImages;
        state.images.side = sideImages;
        state.images.background = background;
        state.assetsReady = true;
        generateImage();
    } catch (error) {
        showError(`${error.message}. Open this page from the project folder or a local web server.`);
    }
}

boot();
