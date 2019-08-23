import crypto from "crypto";

export const create = (text : string): string[] => {
    const sec1 = (Math.random() * 1000000000000000000).toString();
    const sec2 = (Math.random() * 1000000000000000000).toString();
    const sec3 = (Math.random() * 1000000000000000000).toString();
    const sec4 = (Math.random() * 1000000000000000000).toString();
    const sec = sec1.substr(0, 5)
        + sec2.substr(0, 5)
        + sec3.substr(0, 5)
        + sec4.substr(0, 5);
    return [crypto.createHash('md5').update(text + sec).digest('base64'), sec];
};

export const make = (text : string, sec : string): string => crypto.createHash('md5').update(text + sec).digest('base64');