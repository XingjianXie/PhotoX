import express from 'express';
import query from "../../db/query";
import _new from "./add";
import _delete from "./delete";
import edit from "./edit";
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
            res.json({
                code: 416,
                total: total,
            });
            return;
        }

        res.json({
            content: { config: rs },
            total: total,
        });
    });
    //router.use(xauth("system"))
    router.put('/', _new(state));
    router.patch('/', edit(state))
    router.delete('/', _delete(state));
    return router;
};
