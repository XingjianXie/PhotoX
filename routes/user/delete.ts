import express = require('express');
import {MemoryStore} from "express-session";
import query from "../../db/query";
import createError from "http-errors";

export default (session_map : any, db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.userID))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.body.userID)]);
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.body.userID)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        await new Promise((resolve, reject) => {
            req.sessionStore.destroy(session_map[Number(req.body.userID)], (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        session_map[req.body.userID] = undefined;

        await db(query.deleteUser, [Number(req.body.userID)]);
        res.status(200);
        if (Number(req.body.userID) === req.session.userID) {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Delete Successfully",
                inf: "Your account is deleted",
                home: true
            });
        }
        else {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Delete Successfully",
                inf: "The user just deleted will be logout",
            });
        }
    });
    return router;
};
