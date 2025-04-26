export function generateRandomBuffer(size) {
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256); // случайное число 0-255
    }
    return buffer;
}
