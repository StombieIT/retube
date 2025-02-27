export function round(num: number, radix = 0) {
    const degree = Math.pow(10, radix);

    return Math.trunc(num * degree) / degree;
}