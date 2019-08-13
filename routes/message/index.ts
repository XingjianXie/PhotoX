import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import mark_as_read from "./mark_as_read";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs = !req.query.wd
            ? await db(query.queryMyMessageWithLimit, [req.session.userID, req.session.userID, (pg - 1) * maximum, maximum])
            : await db(query.searchMyMessageWithLimit, [req.session.userID, req.session.userID, req.query.wd, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryMyMessageWithLimit, [req.session.userID, req.session.userID]))[0]['COUNT(*)']
            : (await db(query.countSearchMyMessageWithLimit, [req.session.userID, req.session.userID, req.query.wd, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.redirect("/message?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString());
            return;
        }

        res.render('message', {
            messages: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
        });
    });
    router.use('/mark_as_read', mark_as_read(db));
    return router;
};
