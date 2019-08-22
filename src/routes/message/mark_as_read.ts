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
        if (req.body.messageID) {
            if (isNaN(Number(req.body.messageID))) {
                next(createError(400, 'Message ID Should Be A Number'));
                return;
            }
            const rs = await db(query.countMyUnreadMessage, [req.session.userID, req.session.userID, Number(req.body.messageID)]);
            if (!rs[0]) {
                db(query.log, [req.session.userID, "Message", rs[0].id, "Read", false, "Error: Message Not Found"]);
                next(createError(404, 'Message Not Found'));
                return;
            }

            db(query.log, [req.session.userID, "Message", rs[0].id, "Read", true, null]);
            await db(query.readMessage, [req.session.userID, rs[0].id]);
            res.sendStatus(200);
        } else {
            const rs = await db(query.queryMyUnreadMessage, [req.session.userID, req.session.userID]);
            if (!rs.length) {
                db(query.log, [req.session.userID, "Message", null, "Read All", false, "Error: No Message"]);
                next(createError(404, 'Message Not Found'));
                return;
            }

            db(query.log, [req.session.userID, "Message", null, "Read All", true, null]);
            for (let v of rs)
                await db(query.readMessage, [req.session.userID, v.id]);
            res.sendStatus(200);
        }
    });
    return router;
};
