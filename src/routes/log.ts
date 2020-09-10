import express from 'express';
import query from "../db/query";
import createError from "http-errors";
import auth from "../tools/auth"

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await db(query.queryLogWithLimit, [req.session!.type, (pg - 1) * maximum, maximum])
            : await db(query.searchLogWithLimit, [req.session!.type, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryLogWithLimit, [req.session!.type]))[0]['COUNT(*)']
            : (await db(query.countSearchLogWithLimit, [req.session!.type, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.redirect("/log?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString());
            return;
        }

        res.render('log', {
            logs: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
        });
    });
    return router;
};
