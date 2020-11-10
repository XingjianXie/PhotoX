import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import {AllHtmlEntities} from 'html-entities';
import log from "../../tools/log";
import auth from "../../tools/api/auth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.use('/', async(req, res, next) => {
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
            await state.db(query.addConfig, [req.body.name, req.body.value]);
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                next(createError(400, 'Config ' + req.body.name + ' Exists'));
            } else throw e;
            return
        }
        res.json({
            code: 201,
            msg: "Add Successfully",
        });
    });

    return router;
};
