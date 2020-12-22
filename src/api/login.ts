import express from 'express';
import query from '../db/query';
import {make as ps_make} from '../tools/password';
import createError from "http-errors";
import log from "../tools/api/log";
import auth from "../tools/api/auth"
import StateObject from "../class/state_object";
import session_killer from "../tools/session_killer";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', (req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        res.json({
            code: 200,
            content: {
                view: {
                    allowRegister: res.locals.config.allow_register,
                    allowGuestUpload: res.locals.config.allow_guestUpload,
                    background: res.locals.config.bg1,
                    welcomeWord: res.locals.config.welcome_word
                }
            }
        })
    });

    router.post('/', async(req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        if (!req.body.phone_number) {
            next(createError(400, 'Phone Number Required'));
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
        const rs : any[] = await state.db(query.getUserByPhoneNumber, [Number(req.body.phone_number)]);
        if (!rs[0]) {
            next(createError(404, 'User Not Found'));
            return;
        }
        if (ps_make(req.body.pwd, rs[0].passrd) === rs[0].passcode) {
            await session_killer(state, rs[0].id);
            req.session!.sign = true;
            req.session!.userID = rs[0].id;
            req.session!.type = rs[0].type;
            req.session!.name = rs[0].name;
            state.session_map[rs[0].id] = req.sessionID;
            log(res.locals.config, state.db, 0, "User", rs[0].id, "Login", true, "IP Address: " + req.headers['x-forwarded-for']);
            res.json({
                "code": 302,
                "url": "/"
            })
        } else {
            log(res.locals.config, state.db, 0, "User", rs[0].id, "Login", false, "IP Address: " + req.headers['x-forwarded-for'] + "; Error: Unauthorized");
            next(createError(401, ' Password Unauthorized'));
        }
    });
    return router;
};
