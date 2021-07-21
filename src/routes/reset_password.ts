import express from 'express';
import query from '../db/query';
import {make as ps_make, create as ps_create} from '../tools/password';
import createError from "http-errors";
import log from "../tools/log";
import auth from "../tools/auth";
import StateObject from "../class/state_object";
import session_killer from "../tools/session_killer";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', (req, res, next) => {
        res.render("reset_password", { pre: req.query.id });
    });
    router.post('/', async(req, res, next) => {
        let id = 0;
        if (req.session.type) {
            if (!req.body.id) {
                next(createError(400, 'User ID Required'));
                return;
            }
            if (isNaN(Number(req.body.id))) {
                next(createError(400, 'User ID Should Be Number'));
                return;
            }
            if (req.body.pwd_old && Number(req.body.id) !== req.session.userID) {
                log(res.locals.config, state.db, req.session.userID, "User", Number(req.body.id), "Reset Password", false, "Error: Unauthorized");
                next(createError(401, 'Unauthorized'));
                return;
            }
            id = Number(req.body.id);
        } else {
            if (req.body.id) {
                log(res.locals.config, state.db, req.session.userID, "User", Number(req.body.id), "Reset Password", false, "Error: Unauthorized");
                next(createError(401, 'Unauthorized'));
                return;
            }
            if (!req.body.pwd_old) {
                log(res.locals.config, state.db, req.session.userID, "User", req.session.userID, "Reset Password", false, "Error: Bad Request");
                next(createError(400, 'Old Password Required'));
                return;
            }
            id = req.session.userID;
        }
        if (!req.body.pwd_new) {
            log(res.locals.config, state.db, req.session.userID, "User", id, "Reset Password", false, "Error: Bad Request");
            next(createError(400, 'New Password Required'));
            return;
        }

        const rs : any[] = await state.db(query.getUserById, [id]);
        if (!rs.length) {
            log(res.locals.config, state.db, req.session.userID, "User", id, "Reset Password", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (Number(req.body.id) !== req.session.userID && res.locals.config.disable_admin_reset_password) {
            log(res.locals.config, state.db, req.session.userID, "User", id, "Reset Password", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        if (req.session.type > rs[0].type || ps_make(req.body.pwd_old, rs[0].passrd) === rs[0].passcode) {
            const ps_new = ps_create(req.body.pwd_new);
            await state.db(query.resetPassword, [ ps_new[0], ps_new[1], id]);
            const userID = req.session.userID;
            await session_killer(state, id);
            state.session_map[id] = undefined;

            log(res.locals.config, state.db, userID, "User", id, "Reset Password", true, null);

            if (id === userID) {
                res.status(200);
                res.render('notification', {
                    code: 200,
                    msg: "Update Successfully",
                    inf: "Please login again",
                    home: true
                });
            }
            else {
                res.status(200);
                res.render('notification', {
                    code: 200,
                    msg: "Update Successfully",
                    inf: "The user just reset password will be logout",
                });
            }
        } else {
            log(res.locals.config, state.db, req.session.userID, "User", id, "Reset Password", false, "Error: Unauthorized");
            next(createError(401, 'Password or Privilege Unauthorized'));
        }
    });
    return router;
};
