import express = require('express');
import {MemoryStore} from "express-session";
import query from "../../db/query";
import createError from "http-errors";

export default (session_map : any, db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        console.log(req.body);
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.userID))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.body.userID)]);
        if (!rs[0]) {
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.body.userID)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Delete Confirmation',
                inf1: 'Are you sure to delete user ' + req.body.userID + '?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }
        await new Promise((resolve, reject) => {
            req.sessionStore!.destroy(session_map[Number(req.body.userID)], (err) => {
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
