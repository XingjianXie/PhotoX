import {Md5} from "ts-md5";
import crypto = require("crypto");

export const create = (text : string): string[] => {
    const sec1 = (Math.random() * 1000000000000000000).toString();
    const sec2 = (Math.random() * 1000000000000000000).toString();
    const sec3 = (Math.random() * 1000000000000000000).toString();
    const sec4 = (Math.random() * 1000000000000000000).toString();
    const sec = sec1.substr(0, 5)
        + sec2.substr(0, 5)
        + sec3.substr(0, 5)
        + sec4.substr(0, 5);
    return [Md5.hashStr(text + sec).toString(), sec];
};

export const make = (text : string, sec : string): string => Md5.hashStr(text + sec).toString();