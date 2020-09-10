import express from 'express';
import createError from "http-errors";

let level = {
    "sign": -1,
    "admin": 0,
    "system": 126
}

export = (name: "sign" | "admin" | "system") => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!req.session || !req.session!.sign || req.session!.type <= level[name]) {
            if (req.method === "GET") {
                res.redirect('/');
            } else if (req.method === "POST") {
                next(createError(401, 'Unauthorized'));
            }
            return
        }
        next()
    }
}