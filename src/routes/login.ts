import express from 'express';
import query from '../db/query';
import {make as ps_make} from '../tools/password';
import createError from "http-errors";
import log from "../tools/log";
import auth from "../tools/auth"
import StateObject from "../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', (req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        res.render("login");
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
            await new Promise(async (resolve, reject) => {
                state.redis.del((await state.session_map[rs[0].id]), (err) => {
                    if(err) reject(err);
                    else resolve();
                });
            });
            req.session!.sign = true;
            req.session!.userID = rs[0].id;
            req.session!.type = rs[0].type;
            req.session!.name = rs[0].name;
            state.session_map[rs[0].id] = req.sessionID;
            log(res.locals.config, state.db, 0, "User", rs[0].id, "Login", true, "IP Address: " + req.headers['x-forwarded-for']);
            res.redirect('/');
        } else {
            log(res.locals.config, state.db, 0, "User", rs[0].id, "Login", false, "IP Address: " + req.headers['x-forwarded-for'] + "; Error: Unauthorized");
            next(createError(401, ' Password Unauthorized'));
        }
    });
    return router;
};
