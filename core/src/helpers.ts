export async function retry<T>(task: () => Promise<T>, count = Infinity) {
    if (count <= 0) {
        throw new Error('Count should be more than zero');
    }
    while (true) {
        try {
            return await task();
        } catch (err) {
            count--;
            if (!count) {
                throw err;
            }
        }
    }
}
