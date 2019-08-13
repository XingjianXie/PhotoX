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
import log from './log'
import message from './message/index'

export default (session_map : any, db: (sql : string, values : any) => Promise<any>, multer : multer.Instance) => {
    const router = express.Router();
    router.get('/',  (req, res) => {
        if (!req.session || !req.session.sign) res.redirect('/login');
        else res.redirect('/gallery');
    });

    router.use('/login', login(session_map, db));
    router.use('/logout', logout(session_map, db));
    router.use('/gallery', gallery(db, multer));
    router.use('/user', user(session_map, db));
    router.use('/create_password', create_password());
    router.use('/reset_password', reset_password(session_map, db));
    router.use('/log', log(db));
    router.use('/message', message(db));
    /* JUST FOR FUN
    router.use('/520/:id', async(req, res) => {
        if (!req.session || !req.session.sign) res.redirect('/login');
        for (let i = 0; i < 520; i++)
            await db('insert into message(`from`, `to`, `content`) values(?, ?, "我喜欢你")',[req.session!.userID, req.params.id]);
        res.sendStatus(200);
    });
     */

    router.use((req, res, next) => {
        next(createError(404));
    });

    router.use((err : any, req: express.Request, res: express.Response, next: Function) => {
        res.status(err.status || 500);
        res.render('notification', {
            code: err.status || 500,
            msg: err.message,
            inf: req.app.get('env') === 'development' ? err.stack : null,
            home: err.status === 401
        });
    });
    return router;
};
