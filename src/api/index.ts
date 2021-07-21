import express from 'express';
import createError from "http-errors";

import layout from './layout';
import login from './login';
import register from './register';
import logout from './logout';
import gallery from './gallery';
import user from './user';
import reset_password from './reset_password'
import log from './log'
import message from './message'
import uploads from './uploads'
import config from './config'
import guest_upload from "./guest_upload";
import status from "./status";
import xauth from "../tools/api/xauth";
import StateObject from '../class/state_object';

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/',  (req, res) => {
        if (!req.session || !req.session.sign) res.json({
            code: 302,
            url: "/login"
        })
        else res.json({
            code: 302,
            url: "/gallery"
        })
    });

    //router.use(xauth("none"))
    router.use('/layout', layout(state));
    router.use('/login', login(state));
    router.use('/register', register(state));
    router.use('/uploads', uploads(state));
    router.use('/guest_upload', guest_upload(state));

    router.use(xauth("sign"))
    router.use('/message', message(state));
    router.use('/logout', logout(state));
    router.use('/reset_password', reset_password(state));
    router.use('/gallery', gallery(state));

    router.use(xauth("admin"))
    router.use('/user', user(state));

    router.use(xauth("system"))
    router.use('/config', config(state));
    router.use('/status', status(state));
    router.use('/log', log(state));

    router.use((req, res, next) => {
        next(createError(404));
    });

    router.use((err : any, req: express.Request, res: express.Response, next: Function) => {
        res.json({
            code: err.status || 500,
            msg: err.message,
            inf: req.app.get('env') === 'development' ? err.stack : null,
        })
    });
    return router;
};
