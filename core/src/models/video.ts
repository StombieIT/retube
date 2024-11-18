export type VideoId = string;

export interface IVideoChunk {
    id: VideoId;
    // Представление чанка видео в виде последовательности байт
    content: Buffer;
    // Байт, с которого начинается текущий чанк в исходном видео
    startByte: number;
    // Размер чанка [1-4096]
    size: number;
}