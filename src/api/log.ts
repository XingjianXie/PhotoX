import express from 'express';
import query from "../db/query";
import createError from "http-errors";
import auth from "../tools/api/auth"
import StateObject from "../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await state.db(query.queryLogWithLimit, [req.session!.type, (pg - 1) * maximum, maximum])
            : await state.db(query.searchLogWithLimit, [req.session!.type, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await state.db(query.countQueryLogWithLimit, [req.session!.type]))[0]['COUNT(*)']
            : (await state.db(query.countSearchLogWithLimit, [req.session!.type, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd, req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.json({
                code: 416,
                total: total,
            });
            return;
        }

        res.json({
            content: { log: rs },
            total: total,
        });
    });
    return router;
};
