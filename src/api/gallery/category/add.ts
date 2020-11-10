import express from 'express';
import query from "../../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../../tools/password";
import {AllHtmlEntities} from 'html-entities';
import log from "../../../tools/log";
import auth from "../../../tools/api/auth";
import StateObject from "../../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (res.locals.config.disable_admin_add_category) {
            log(res.locals.config, state.db, req.session!.userID, "Category", null, "Add", false, "Error: Disabled");
            next(createError(400, 'Disabled'));
            return;
        }
        res.render('add_category');
    });

    router.post('/', async(req, res, next) => {
        if (!req.body.name) {
            log(res.locals.config, state.db, req.session!.userID, "Category", null, "Add", false, "Error: Bad Request");
            next(createError(400, 'Name Required'));
            return;
        }
        if (res.locals.config.disable_admin_add_category) {
            log(res.locals.config, state.db, req.session!.userID, "Category", null, "Add", false, "Error: Disabled");
            next(createError(400, 'Disabled'));
            return;
        }
        try {
            const id : number = (await state.db(query.addCategory, [req.body.name, req.session!.userID])).insertId;
            log(res.locals.config, state.db, req.session!.userID, "Category", id, "Add", true, null);
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                log(res.locals.config, state.db, req.session!.userID, "Category", null, "Add", false, "Error: Exists");
                next(createError(400, 'Category ' + req.body.name + ' Exists'));
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
