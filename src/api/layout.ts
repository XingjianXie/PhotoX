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
        let login = req.session ? req.session.sign : false
        res.json({
            code: 200,
            content: {
                user: {
                    login,
                    name: login ? req.session!.name : "GUEST",
                    id: login ? req.session!.userId : -1,
                    type: login ? req.session!.type : -1,
                    typeName: login ? res.locals.typeName[req.session!.type] : "Guest",
                    allowRegister: res.locals.config.allow_register
                },
                message: res.locals.unreadMeessageLength
            }
        })
    });
    return router;
};
