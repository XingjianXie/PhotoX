import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import log from "../../tools/api/log";
import auth from "../../tools/api/auth"
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();

    router.use('/', async(req, res, next) => {
        if (isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type)) < 0) {
            next(createError(400, 'Type Should Be A Number From 0 to 126'));
            return;
        }
        if (isNaN(Number(req.body.phone_number)) || Number(req.body.phone_number).toString().length !== 11) {
            next(createError(400, 'Phone Number Invalid'));
            return;
        }
        if (req.session.type < Number(req.body.type)) {
            log(res.locals.config, state.db, req.session.userID, "User", null, "Create", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name) {
            log(res.locals.config, state.db, req.session.userID, "User", null, "Create", false, "Error: Bad Request");
            next(createError(400, 'Name Required'));
            return;
        }
        if (!req.body.pwd) {
            log(res.locals.config, state.db, req.session.userID, "User", null, "Create", false, "Error: Bad Request");
            next(createError(400, 'Password Required'));
            return;
        }
        if (res.locals.config.disable_admin_add_user) {
            log(res.locals.config, state.db, req.session.userID, "User", null, "Create", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const password = ps_create(req.body.pwd);
        try {
            const id : number = (await state.db(query.addUser, [req.body.phone_number, req.body.name, req.body.type, password[0], password[1]])).insertId;
            log(res.locals.config, state.db, req.session.userID, "User", id, "Create", true, null);

            res.json({
                code: 201,
                msg: "Add Successfully",
            });
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                log(res.locals.config, state.db, req.session.userID, "User", null, "Create", false, "Error: Duplicate Phone Number");
                next(createError(400, 'Phone Number Has Been Taken. If You Previously Used the Same Phone Number for Uploading Photos as Guest, Ask Admin to Migrate Your Account '));
            } else throw e;
        }
    });

    return router;
};
