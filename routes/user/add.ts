import express = require('express');
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
        res.render('add_user');
    });

    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type)) < 0) {
            next(createError(400, 'Type Should Be A Number From 0 to 126'));
            return;
        }
        if (req.session.type < Number(req.body.type)) {
            db(query.log, [req.session.userID, "User", null, "Create", false, "Reason: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name) {
            db(query.log, [req.session.userID, "User", null, "Create", false, "Reason: Bad Request"]);
            next(createError(400, 'Name Required'));
            return;
        }
        if (!req.body.pwd) {
            db(query.log, [req.session.userID, "User", null, "Create", false, "Reason: Bad Request"]);
            next(createError(400, 'Password Required'));
            return;
        }
        if (req.body.confirm === '1' && req.session.type === Number(req.body.type)) {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Add User Confirmation',
                inf1: 'Are you sure to add a user who have the same type with you?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }
        const password = ps_create(req.body.pwd);
        const id = (await db(query.addUser, [req.body.name, req.body.type, password[0], password[1]])).insertId;

        db(query.log, [req.session.userID, "User", id, "Create", true, null]);

        res.status(201);
        res.render('message', {
            code: 201,
            msg: "Add Successfully",
            inf: "Please Remember Your User ID: " + id,
        });
    });

    return router;
};
