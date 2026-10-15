const originalBaconDictionary = {
    a: "00000", b: "00001", c: "00010", d: "00011", e: "00100",
    f: "00101", g: "00110", h: "00111", i: "01000", j: "01000",
    k: "01001", l: "01010", m: "01011", n: "01100", o: "01101",
    p: "01110", q: "01111", r: "10000", s: "10001", t: "10010",
    u: "10011", v: "10011", w: "10100", x: "10101", y: "10110",
    z: "10111"
};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load ${src}`));
        img.src = src;
    });
}
