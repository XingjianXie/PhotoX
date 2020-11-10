import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import {AllHtmlEntities} from 'html-entities';
import log from "../../tools/log";
import auth from "../../tools/api/auth"
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/:name', async(req, res, next) => {
        if (!req.params.name) {
            next(createError(400, 'Name Required'));
            return;
        }
        let rs = await state.db(query.getConfigByName, [req.params.name]);
        if (!rs[0]) {
            next(createError(404, 'Config Not Found'));
            return;
        }
        res.render('edit_config', {c: rs[0]});
    });

    router.post('/:name', async(req, res, next) => {
        if (!req.params.name) {
            next(createError(400, 'Name Required'));
            return;
        }
        if (!req.body.value) {
            next(createError(400, 'Value Required'));
            return;
        }
        let rs = await state.db(query.getConfigByName, [req.params.name]);
        if (!rs[0]) {
            next(createError(404, 'Config Not Found'));
            return;
        }
        try {
            JSON.parse(req.body.value)
        } catch {
            next(createError(400, 'Value Not Object'));
            return
        }
        await state.db(query.updateConfig, [req.body.value, req.params.name]);
        res.render('notification', {
            code: 200,
            msg: "Update Successfully",
            bk2: true
        });
    });

    return router;
};
