import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import {AllHtmlEntities} from 'html-entities';
import log from "../../tools/log";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || req.session.type !== 127) {
            res.redirect('/');
            return;
        }
        res.render('add_config');
    });

    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || req.session.type !== 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name) {
            next(createError(400, 'Name Required'));
            return;
        }
        if (!req.body.value) {
            next(createError(400, 'Value Required'));
            return;
        }
        try {
            JSON.parse(req.body.value)
        } catch {
            next(createError(400, 'Value Not Object'));
            return
        }
        try {
            await db(query.addConfig, [req.body.name, req.body.value]);
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                next(createError(400, 'Config ' + req.body.name + ' Exists'));
            } else throw e;
            return
        }
        res.status(201);
        res.render('notification', {
            code: 201,
            msg: "Add Successfully",
            bk2: true
        });
    });

    return router;
};
