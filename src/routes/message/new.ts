import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import {encode} from 'html-entities';
import log from "../../tools/log";
import auth from "../../tools/auth";
import xauth from "../../tools/xauth";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (res.locals.config.disable_admin_send_message) {
            next(createError(401, 'Disabled'));
            return;
        }
        res.render('new_message', { pre: req.query.id });
    });

    router.post('/', async(req, res, next) => {
        if (!req.body.content) {
            next(createError(400, 'Content Required'));
            return;
        }
        if (!req.body.send_button || (req.body.send_button !== "Send" && req.body.send_button !== "Send Html")) {
            next(createError(400, 'Bad Request'));
            return;
        }
        if (req.body.send_button === "Send Html" && req.session.type !== 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const rs : any[] = await state.db(query.getUserById, [Number(req.body.id)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session.userID, "User", Number(req.body.id), "Send Message", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (res.locals.config.disable_admin_send_message) {
            next(createError(401, 'Disabled'));
            return;
        }
        const id : number = (await state.db(query.addMessage, [req.session.userID, req.body.id ? req.body.id : null, req.body.send_button === "Send" ? encode(req.body.content).replace(/\n/g, "<br>") : req.body.content])).insertId;
        log(res.locals.config, state.db, req.session.userID, "Message", id, "Create", true, "Content: " + req.body.content + ", Html: " + (req.body.send_button === "Send" ? "False" : "True"));
        log(res.locals.config, state.db, req.session.userID, "User", req.body.id ? Number(req.body.id) : null, "Send Message", true, "Message ID: " + id.toString());
        res.render('notification', {
            code: 200,
            msg: "Send Successfully",
            bk2: true
        });
    });

    return router;
};
