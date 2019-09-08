import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import mark_as_read from "./mark_as_read";
import _new from "./new";
import { AllHtmlEntities } from 'html-entities';

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        if (!req.session.type && !!req.query.sent) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        let rs : any[], total : number;
        if (!req.query.sent) {
            rs = !req.query.wd
                ? await db(query.queryMyMessageWithLimit, [req.session.userID, req.session.userID, (pg - 1) * maximum, maximum])
                : await db(query.searchMyMessageWithLimit, [req.session.userID, req.session.userID, new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await db(query.countQueryMyMessageWithLimit, [req.session.userID, req.session.userID]))[0]['COUNT(*)']
                : (await db(query.countSearchMyMessageWithLimit, [req.session.userID, req.session.userID, new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd)]))[0]['COUNT(*)'];
        } else {
            rs = !req.query.wd
                ? await db(query.querySentMessageWithLimit, [req.session.userID, (pg - 1) * maximum, maximum])
                : await db(query.searchSentMessageWithLimit, [req.session.userID, new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), (pg - 1) * maximum, maximum]);
            total = !req.query.wd
                ? (await db(query.countQuerySentMessageWithLimit, [req.session.userID]))[0]['COUNT(*)']
                : (await db(query.countSearchSentMessageWithLimit, [req.session.userID, new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd), new AllHtmlEntities().encode(req.query.wd)]))[0]['COUNT(*)'];
        }

        if (!rs.length && total) {
            res.redirect("/message?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString() + !req.query.sent ? "&sent=1" : "");
            return;
        }

        res.render(!req.query.sent ? 'message' : 'message_sent', {
            messages: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
        });
    });
    router.use('/mark_as_read', mark_as_read(db));
    router.use('/new', _new(db));
    return router;
};
