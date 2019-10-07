import express from 'express';
import {MemoryStore} from "express-session";
import query from "../../db/query";
import createError from "http-errors";

export default (db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || req.session.type !== 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const rs : any[] = await db(query.getDeletableConfigByName, [req.body.name]);
        if (!rs[0]) {
            next(createError(404, 'Config Not Found'));
            return;
        }
        if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Delete Confirmation',
                inf1: 'Are you sure to delete config ' + rs[0].name,
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }

        await db(query.deleteConfig, [rs[0].name]);

        res.render('notification', {
            code: 200,
            msg: "Delete Successfully",
        });
    });
    return router;
};
