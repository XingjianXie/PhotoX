import express from 'express';
import createError from "http-errors";
import {MemoryStore} from "express-session";
import multer from "multer";

import login from './login';
import logout from './logout';
import gallery from './gallery/index';
import user from './user/index';
import create_password from './create_password'
import reset_password from './reset_password'

export default (session_map : any, db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/',  (req, res) => {
        if (req.session.sign) res.redirect('/gallery');
        else res.redirect('/login');
    });

    router.use('/login', login(session_map, db));
    router.use('/logout', logout(session_map));
    router.use('/gallery', gallery(db, multer));
    router.use('/user', user(session_map, db));
    router.use('/create_password', create_password());
    router.use('/reset_password', reset_password(session_map, db));

    router.use((req, res, next) => {
        next(createError(404));
    });

    router.use((err : any, req: express.Request, res: express.Response, next: Function) => {
        res.status(err.status || 500);
        res.render('message', {
            code: err.status || 500,
            msg: err.message,
            inf: req.app.get('env') === 'development' ? err.stack : null,
            home: err.status === 401
        });
    });
    return router;
};
