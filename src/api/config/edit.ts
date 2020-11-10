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
    router.use('/:name', async(req, res, next) => {
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
        res.json({
            code: 200,
            msg: "Update Successfully",
        });
    });

    return router;
};
