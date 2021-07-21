import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import log from "../../tools/api/log";
import auth from "../../tools/api/auth";
import StateObject from "../../class/state_object";
import session_killer from "../../tools/session_killer";

export default (state: StateObject) => {
    const router = express.Router();

    router.use('/:id', async(req, res, next) => {
        if (req.body.type && (isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type))) < 0) {
            next(createError(400, 'Type Should Be A Number From 0 to 126'));
            return;
        }
        if (req.body.phone_number && (isNaN(Number(req.body.phone_number)) || Number(req.body.phone_number).toString().length !== 11)) {
            next(createError(400, 'Phone Number Invalid'));
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs : any[] = await state.db(query.getUserById, [Number(req.params.id)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session.userID, "User", Number(req.params.id), "Edit", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type <= rs[0].type && req.session.userID !== rs[0].id) {
            log(res.locals.config, state.db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            log(res.locals.config, state.db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.session.type < Number(req.body.type)) {
            log(res.locals.config, state.db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name && !req.body.type && !req.body.phone_number) {
            log(res.locals.config, state.db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Bad Request");
            next(createError(400, 'Type or Name Required'));
            return;
        }
        if (res.locals.config.disable_admin_edit_user) {
            log(res.locals.config, state.db, req.session.userID, "User", rs[0].id, "Edit", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const userID = req.session.userID;
        await session_killer(state, rs[0].id);
        state.session_map[rs[0].id] = undefined;

        if (req.body.type) {
            await state.db(query.resetUserType, [Number(req.body.type), rs[0].id]);
            log(res.locals.config, state.db, userID, "User", rs[0].id, "Reset Type", true, "Previous Type: " + res.locals.typeName[rs[0].type]);
        }
        if (req.body.name) {
            await state.db(query.resetUserName, [req.body.name, rs[0].id]);
            log(res.locals.config, state.db, userID, "User", rs[0].id, "Reset Name", true, "Previous Name: " + rs[0].name);
        }
        try {
            if (req.body.phone_number) {
                await state.db(query.resetUserPhoneNumber, [req.body.phone_number, rs[0].id]);
                log(res.locals.config, state.db, userID, "User", rs[0].id, "Reset Phone Number", true, "Previous Phone Number: " + rs[0].phone_number);
            }
            if (rs[0].id === userID) {
                res.json({
                    code: 200,
                    msg: "Update Successfully",
                    inf: "Please login again",
                });
            }
            else {
                res.json({
                    code: 200,
                    msg: "Update Successfully",
                    inf: "The user just edited will be logout",
                });
            }
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                log(res.locals.config, state.db, userID, "User", rs[0].id, "Reset Phone Number", false, "Error: Duplicate");
                next(createError(400, 'Not Completely Finished: Phone Number Has Been Taken'));
            } else throw e;
        }
    });

    return router;
};
