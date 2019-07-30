import express = require('express');
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (!req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        res.render('add_user');
    });

    router.post('/', async(req, res, next) => {
        if (!req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type)) < 0) {
            next(createError(400, 'Type Should Be A Number From 0 to 126'));
            return;
        }
        if (req.session.type < Number(req.body.type)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name) {
            next(createError(400, 'Name Required'));
            return;
        }
        if (!req.body.pwd) {
            next(createError(400, 'Password Required'));
            return;
        }
        const password = ps_create(req.body.pwd);
        const rs = await db(query.addUser, [req.body.name, req.body.type, password[0], password[1]]);
        res.status(201);
        res.render('message', {
            code: 201,
            msg: "Add Successfully",
            inf: "Please Remember Your User ID: " + rs.insertId,
        });
    });

    return router;
};
