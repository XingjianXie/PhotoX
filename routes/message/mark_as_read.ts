import express from 'express';
import {MemoryStore} from "express-session";
import query from "../../db/query";
import createError from "http-errors";

export default (db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.messageID))) {
            next(createError(400, 'Message ID Should Be A Number'));
            return;
        }
        const rs = await db(query.queryMyUnreadMessage, [req.session.userID, req.session.userID]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "Message", Number(req.body.messageID), "Read", false, "Error: Message Not Found"]);
            next(createError(404, 'Message Not Found'));
            return;
        }

        db(query.log, [req.session.userID, "Message", req.body.messageID, "Read", true, null]);
        db(query.readMessage, [req.session.userID, req.body.messageID]);
        res.sendStatus(200);
    });
    return router;
};
