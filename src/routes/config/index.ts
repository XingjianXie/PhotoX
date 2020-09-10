import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import _new from "./add";
import _delete from "./delete";
import edit from "./edit";
import auth from "../../tools/auth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await state.db(query.queryConfigWithLimit, [(pg - 1) * maximum, maximum])
            : await state.db(query.searchConfigWithLimit, [req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await state.db(query.countQueryConfigWithLimit, []))[0]['COUNT(*)']
            : (await state.db(query.countSearchConfigWithLimit, [req.query.wd]))[0]['COUNT(*)'];

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
    //router.use(xauth("system"))
    router.use('/new', _new(state));
    router.use('/delete', _delete(state));
    router.use('/edit', edit(state))
    return router;
};
