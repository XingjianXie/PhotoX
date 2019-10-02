import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import _new from "./add";
import _delete from "./delete";
import edit from "./edit";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        if (!req.session || !req.session.sign || req.session.type !== 127) {
            res.redirect('/');
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await db(query.queryConfigWithLimit, [(pg - 1) * maximum, maximum])
            : await db(query.searchConfigWithLimit, [req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryConfigWithLimit, []))[0]['COUNT(*)']
            : (await db(query.countSearchConfigWithLimit, [req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.redirect("/config?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString());
            return;
        }

        res.render('config', {
            configs: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
        });
    });
    router.use('/new', _new(db));
    router.use('/delete', _delete(db));
    router.use('/edit', edit(db))
    return router;
};
