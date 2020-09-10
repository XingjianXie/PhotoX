import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import add from "./add";
import _delete from './delete';
import edit from "./edit";
import logout from "./logout";
import auth from "../../tools/auth";
import xauth from "../../tools/xauth";

export default (session_map: any, db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await db(query.queryUserWithLimit, [req.session!.type, (pg - 1) * maximum, maximum])
            : await db(query.searchUserWithLimited, [req.session!.type, isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryUserWithLimit, [req.session!.type]))[0]['COUNT(*)']
            : (await db(query.countSearchUserWithLimited, [req.session!.type, isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), isNaN(Number(req.query.wd)) ? -1 : Number(req.query.wd), req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.redirect("/user?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString());
            return;
        }

        let new_map : any = {};
        for (const value of rs) {
            new_map[value.id] = await session_map[value.id];
        };

        res.render('user', {
            users: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
            map: new_map
        });
    });
    //router.use(xauth("admin"))
    router.use('/delete', _delete(session_map, db));
    router.use('/logout', logout(session_map, db));
    router.use('/add', add(db));
    router.use('/edit', edit(session_map, db));
    return router;
};
