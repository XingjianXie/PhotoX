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
import StateObject from "./class/state_object";


export default async function create_application() {
    const redisStore = require('connect-redis')(session);
    const RedisConfig = require('./db/RedisConfig');

    const app = express();
    app.set('root', path.join(__dirname, '../'));
    const redis_client = redis.createClient(RedisConfig);
    const store : Store = new redisStore({ client: redis_client });
    const session_map : any = new Proxy({}, {
        async get(target, index) {
            return await promisify(redis_client.get).bind(redis_client)('state.session_map:' + index.toString());
        },
        set(target, index, value, receiver) {
            if (value === undefined)
                redis_client.del("state.session_map:" + index.toString());
            else {
                redis_client.set('state.session_map:' + index.toString(), value);
                redis_client.expire('state.session_map:' + index.toString(), 60 * 1000 * 60 * 12)
            }
            return true;
        }
    });
    let config : any = {};
    for (let obj of await db(query.config, [])) {
        try {
            config[obj.name] = JSON.parse(obj.value);
        } catch {
            config[obj.name] = null;
        }
    }

    app.set('views', 'views');
    app.set('port', normalizePort(config.port || '3001'));
    function normalizePort(val: string) {
        const port = Number(val);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    app.set('view engine', 'pug');
    app.enable('view cache');
    app.set('env', config.env || "development");

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({
        secret: config.session_secret,
        cookie: { maxAge: 60 * 1000 * 60 * 12 },
        resave: false,
        store: store,
        saveUninitialized: false,
    }));

    app.use(express.static(path.join(app.get('root'), 'public')));

    app.use(async(req, res, next) => {
        config = {};
        for (let obj of await db(query.config, [])) {
            try {
                config[obj.name] = JSON.parse(obj.value);
            } catch {
                config[obj.name] = null;
            }
        }

        res.locals.config = config;
        res.locals.session = req.session;
        if (req.session && req.session!.sign)
            res.locals.unreadMeessageLength = (await db(query.countQueryMyUnreadMessage, [req.session!.userID, req.session!.userID]))[0]['COUNT(*)'];
        res.locals.typeName = new Proxy({}, {
            get(target, index) {
                if (!isNaN(Number(index))) {
                    switch (Number(index)) {
                        case 0: return 'Standard';
                        case 1: return 'Admin';
                        case 2: return 'Super Admin';
                        case 126: return 'Guest Upload Account';
                        case 127: return 'System';
                        default: return 'Unknown';
                    }
                }
            }
        });

        res.locals.url = req.url;

        if (config["maintenance_mode"]) {
            res.render('notification', {
                code: 503,
                msg: "Service Unavailable",
                inf: "PhotoX is not available. This may imply a maintenance script is running or the service is updating. Please wait for a while.",
                home: true
            });
            return
        }

        next();
    });

    app.use(index(new StateObject(session_map, db, redis_client)));
    return app;
}