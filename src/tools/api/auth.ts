import express from 'express';
import createError from "http-errors";

let level = {
    "sign": -1,
    "admin": 0,
    "system": 126
}

export = async(req: express.Request, res: express.Response, next: express.NextFunction, type: "redirect" | "deny", name: "nologin" | "sign" | "admin" | "system") => {
    if (name === "nologin") {
        if (req.session && req.session.sign) {
            if (type === "redirect") {
                res.json({
                    code: 302,
                    url: '/'
                });
            } else if (type == "deny") {
                next(createError(401, 'Unauthorized'));
            }
            return false;
        }
        return true
    }
    if (!req.session || !req.session.sign || req.session.type <= level[name]) {
        if (type === "redirect") {
            res.json({
                code: 302,
                url: '/'
            });
        } else if (type == "deny") {
            next(createError(401, 'Unauthorized'));
        }
        return false
    }
    return true
}