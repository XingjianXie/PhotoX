import express = require('express');
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (session_map: any, db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.params.id)]);
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.params.id)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        res.render('edit_user', { u: rs[0] });
    });

    router.post('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type)) < 0) {
            next(createError(400, 'Type Should Be A Number From 0 to 126'));
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.params.id)]);
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.params.id)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.session.type < Number(req.body.type)) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name && !req.body.type) {
            next(createError(400, 'Type or Name Required'));
            return;
        }
        await new Promise((resolve, reject) => {
            req.sessionStore!.destroy(session_map[Number(req.params.id)], (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        session_map[Number(req.params.id)] = undefined;

        if (req.body.type)
            await db(query.resetUserType, [Number(req.body.type), Number(req.params.id)]);
        if (req.body.name)
            await db(query.resetUserName, [req.body.name, Number(req.params.id)]);

        if (Number(req.params.id) === req.session.userID) {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Update Successfully",
                inf: "Please login again",
                home: true
            });
        }
        else {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Update Successfully",
                inf: "The user just edited will be logout",
            });
        }
    });

    return router;
};
