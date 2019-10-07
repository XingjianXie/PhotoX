import express from 'express';
import add from './add';
import _delete from './delete';
import edit from './edit';
import query from "../../../db/query";
import createError from "http-errors";
import log from "../../../tools/log";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/',  async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        if (res.locals.config.disable_admin_edit_category && res.locals.config.disable_admin_add_category && res.locals.config.disable_admin_delete_category) {
            log(res.locals.config, db, req.session.userID, "Category", null, "List Categories", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const pg = Math.max(Number(req.query.pg) || 1, 1);
        const maximum = Math.max(Number(req.query.max) || 5, 1);
        const rs : any[] = !req.query.wd
            ? await db(query.queryCategoryWithLimit, [(pg - 1) * maximum, maximum])
            : await db(query.searchCategoryWithLimit, [req.query.wd, (pg - 1) * maximum, maximum]);
        const total = !req.query.wd
            ? (await db(query.countQueryCategoryWithLimit, []))[0]['COUNT(*)']
            : (await db(query.countSearchCategoryWithLimit, [req.query.wd]))[0]['COUNT(*)'];

        if (!rs.length && total) {
            res.redirect("/gallery/category?pg=" + Math.ceil(total / maximum).toString() + "&wd=" + (req.query.wd || '') + "&max=" + maximum.toString());
            return;
        }

        res.render('category', {
            categories: rs,
            total: total,
            current: pg,
            maximum: maximum,
            wd: req.query.wd,
        });
    });
    router.use('/add', add(db));
    router.use('/edit', edit(db));
    router.use('/delete', _delete(db));
    return router;
};
