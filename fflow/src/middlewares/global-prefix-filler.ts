export function globalPrefixFiller(globalPrefix: string = '') {
    return (req, res, next) => {
        if (!req.url.startsWith(globalPrefix)) {
            req.url = globalPrefix + req.url;
        }
        next();
    };
}
