export type UploadSessionId = string;

export interface IVideoChunk {
    sessionId: UploadSessionId;
    // Представление чанка видео в виде последовательности байт
    content: Buffer;
    // Байт, с которого начинается текущий чанк в исходном видео
    startByte: number;
    // Размер чанка [1-4096]
    size: number;
}