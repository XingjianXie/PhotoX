import express from 'express';
require(`express-async-errors`);

import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from "express-session";
import redis from 'redis';
import index from './routes';
import db from "./db/db";
import {Store} from "express-session";
import {mkdir} from "fs";
import * as util from "util";
import {promisify, types} from "util";
import query from "./db/query";

const redisStore = require('connect-redis')(session);
const multer = require("multer");

const app = express();
app.set('root', path.join(__dirname, '../'));
const redis_client = redis.createClient({ host: require('./db/RedisConfig').host, port: require('./db/RedisConfig').port });
const store : Store = new redisStore({ client: redis_client });
const session_map : any = new Proxy({}, {
    get(target, index) {
        return promisify(redis_client.get).bind(redis_client)('mark07x_session_map:' + index.toString());
    },
    set(target, index, value, receiver) {
        if (value === undefined)
            redis_client.del('mark07x_session_map:' + index.toString());
        else
            redis_client.set('mark07x_session_map:' + index.toString(), value);
        return true;
    }
});
//let session_map : any = {};

// view engine setup
app.set('views', 'views');
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
/*
app.use("/uploads", (req, res, next) => {
    if (!req.session || !req.session.sign) {
        res.redirect('/');
        return;
    }
    next();
});
 */
app.use(express.static(path.join(app.get('root'), 'public')));

app.use(async(req, res, next) => {
    res.locals.session = req.session;
    if (req.session && req.session.sign)
        res.locals.unreadMeessageLength = (await db(query.countQueryMyUnreadMessage, [req.session.userID, req.session.userID]))[0]['COUNT(*)'];
    res.locals.typeName = new Proxy({}, {
        get(target, index) {
            if (!isNaN(Number(index))) {
                switch (Number(index)) {
                    case 0: return 'Editor';
                    case 1: return 'Admin';
                    case 2: return 'Super Admin';
                    case 127: return 'System';
                    default: return 'Unknown';
                }
            }
        }
    });

    res.locals.url = req.url;
    next();
});

util.promisify(mkdir)(path.join(app.get('root'), 'uploads')).catch(err => { if (err.code != 'EEXIST') throw err });
app.use(index(session_map, db, multer( { limits: { fileSize: 1e8 } } )));

export default app;