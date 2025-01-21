export interface Task<T = void> {
    resolve: (data: T) => void;
    reject: (err: Error) => void;
}
