import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        res.render('new_message', { pre: req.query.id });
    });

    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.content) {
            next(createError(400, 'Content Required'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.body.id)]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "User", Number(req.body.id), "Send Message", false, "Error: User Not Found"]);
            next(createError(404, 'User Not Found'));
            return;
        }
        await db(query.addMessage, [req.session.userID, req.body.id ? req.body.id : null, req.body.content]);
        res.status(200);
        res.render('notification', {
            code: 200,
            msg: "Send Successfully",
            bk2: true
        });
    });

    return router;
};
