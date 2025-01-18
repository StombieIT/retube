type Executor<T> = () => Promise<T>;

interface Task<T> {
    executor: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (err: Error) => void;
}

export interface Limiter {
    <T extends any>(executor: Executor<T>): Promise<T>;
}

export function limiter(limit: number): Limiter {
    let current = 0;
    const tasks: Task<any>[] = [];

    const next = () => {
        if (tasks.length === 0) {
            return;
        }

        current++;
        const { executor, resolve, reject } = tasks.shift();
        const pending = executor()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                current--;
            });
        if (current < limit) {
            next();
        } else {
            pending.finally(next);
        }
    };

    return function(executor) {
        return new Promise((resolve, reject) => {
            tasks.push({ executor, resolve, reject });
            next();
        });
    };
}
