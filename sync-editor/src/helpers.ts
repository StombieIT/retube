export function copyToClipboard(text: string) {
    if (!navigator.clipboard) {
        return Promise.resolve();
    }

    return navigator.clipboard.writeText(text);
}
