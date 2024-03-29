import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import add from "./add";
import _delete from './delete';
import edit from "./edit";
import logout from "./logout";
import auth from "../../tools/api/auth";
import xauth from "../../tools/api/xauth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await state.db(query.queryUserWithLimit, [req.session.type, (pg - 1) * maximum, maximum])
            : await state.db(query.searchUserWithLimited, [req.session.type, isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await state.db(query.countQueryUserWithLimit, [req.session.type]))[0]['COUNT(*)']
            : (await state.db(query.countSearchUserWithLimited, [req.session.type, isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.json({
                code: 416,
                total: total,
            });
            return;
        }

        let new_map : any = {};
        for (const value of rs) {
            new_map[value.id] = await state.session_map[value.id];
        };

        res.json({
            content: { user: rs },
            total: total,
        });
    });
    //router.use(xauth("admin"))
    router.use('/logout', logout(state));
    router.put('/', add(state));
    router.patch('/', edit(state));
    router.delete('/', _delete(state));
    return router;
};
