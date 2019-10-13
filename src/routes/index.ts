import express from 'express';
import createError from "http-errors";
import {MemoryStore} from "express-session";
import multer from "multer";

import login from './login';
import register from './register';
import logout from './logout';
import gallery from './gallery';
import user from './user';
import create_password from './create_password'
import reset_password from './reset_password'
import log from './log'
import message from './message'
import uploads from './uploads'
import config from './config'
import guest_upload from "./guest_upload";

export default (session_map : any, db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/',  (req, res) => {
        if (!req.session || !req.session.sign) res.redirect('/login');
        else res.redirect('/gallery');
    });

    router.use('/login', login(session_map, db));
    router.use('/guest_upload', guest_upload(db, multer));
    router.use('/register', register(db));
    router.use('/logout', logout(session_map, db));
    router.use('/gallery', gallery(db, multer));
    router.use('/user', user(session_map, db));
    router.use('/create_password', create_password());
    router.use('/reset_password', reset_password(session_map, db));
    router.use('/log', log(db));
    router.use('/message', message(db));
    router.use('/uploads', uploads(db));
    router.use('/config', config(db));

    router.use((req, res, next) => {
        next(createError(404));
    });

    router.use((err : any, req: express.Request, res: express.Response, next: Function) => {
        res.status(err.status || 500);
        res.render('notification', {
            code: err.status || 500,
            msg: err.message,
            inf: req.app.get('env') === 'development' ? err.stack : null,
        });
    });
    return router;
};
