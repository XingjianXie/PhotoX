import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import add from "./add";
import _delete from './delete';
import edit from "./edit";
import logout from "./logout";

export default (session_map: any, db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs = !req.query.wd
            ? await db(query.queryUserWithLimit, [req.session.type, (pg - 1) * maximum, maximum])
            : await db(query.searchUserWithLimited, [req.session.type, req.query.wd, req.query.wd, (pg - 1) * maximum, maximum]);
        const total = (await db(query.total, []))[0]['total'];

        if (!rs.length) {
            if (total)
                res.redirect("/user?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString());
            next(createError(404, 'User Not Found'));
            return;
        }


        res.render('user', {
            users: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
            map: session_map,
        });
    });
    router.use('/delete', _delete(session_map, db));
    router.use('/logout', logout(session_map, db));
    router.use('/add', add(db));
    router.use('/edit', edit(session_map, db));
    return router;
};
