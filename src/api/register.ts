import express from 'express';
import query from '../db/query';
import {create as ps_create, make as ps_make} from '../tools/password';
import createError from "http-errors";
import log from "../tools/api/log";
import auth from "../tools/api/auth";
import StateObject from "../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', (req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        if (!res.locals.config.allow_register) {
            log(res.locals.config, state.db, 0, "User", null, "Register", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        res.json({
            "code": 200,
            "bg": res.locals.config.bg2
        })
    });

    router.post('/', async(req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        if (!req.body.phone_number) {
            next(createError(400, 'Phone Number Required'));
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
        if (isNaN(Number(req.body.phone_number)) || Number(req.body.phone_number).toString().length != 11) {
            next(createError(400, 'Phone Number Invalid'));
            return;
        }
        if (!res.locals.config.allow_register) {
            log(res.locals.config, state.db, 0, "User", null, "Register", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const password = ps_create(req.body.pwd);
        try {
            const id : number = (await state.db(query.addUser, [req.body.phone_number, req.body.name, 0, password[0], password[1]])).insertId;
            log(res.locals.config, state.db, 0, "User", id, "Register", true, null);

            res.json({
                code: 201,
                msg: "Register Successfully",
                home: true
            });
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                log(res.locals.config, state.db, 0, "User", null, "Register", false, "Error: Duplicate Phone Number");
                next(createError(400, 'Phone Number Has Been Taken. If You Previously Used the Same Phone Number for Uploading Photos as Guest, Ask Admin to Migrate Your Account '));
            } else throw e;
        }
    });
    return router;
};
