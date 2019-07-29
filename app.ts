import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session = require("express-session");
import redis from 'redis';
const redisStore = require('connect-redis')(session);
import multer from "multer";

require(`express-async-errors` );
const app = express();
const store : Store = new redisStore({ host: 'localhost', port: 6379, client: redis.createClient() });
let session_map : any = {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'secret mark07 xx 002376 abc xx',
    cookie: { maxAge: 60 * 1000 * 60 * 12 },
    resave: false,
    store: store,
    saveUninitialized: false,
    destroy_callback: function (session_id) {
        store.get(session_id, (err , session) => {
            if (err) throw err;
            else session_map[session!.id] = undefined;
        });
        return true;
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.typeName = (x: number) => {
        switch (x) {
            case 0: return 'Editor';
            case 1: return 'Admin';
            case 2: return 'Super Admin';
            case 127: return 'System';
            default: return 'Unknown';
        }
    };

    res.locals.url = req.url;
    next();
});

import index from './routes/index';
import db from "./db/db";
import {Store} from "express-session";
app.use(index(session_map, db, multer({ dest: 'uploads/' })));

export default app;