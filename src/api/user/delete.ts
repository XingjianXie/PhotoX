import express from 'express';
import {MemoryStore} from "express-session";
import query from "../../db/query";
import createError from "http-errors";
import log from "../../tools/log";
import auth from "../../tools/api/auth";
import StateObject from "../../class/state_object";
import session_killer from "../../tools/session_killer";

export default (state: StateObject) => {
    const router = express.Router();
    router.use('/:id', async(req, res, next) => {
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs : any[] = await state.db(query.getUserById, [Number(req.params.id)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session!.userID, "User", Number(req.params.id), "Delete", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session!.type <= rs[0].type && req.session!.userID !== Number(req.params.id)) {
            log(res.locals.config, state.db, req.session!.userID, "User", rs[0].id, "Delete", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            log(res.locals.config, state.db, req.session!.userID, "User", rs[0].id, "Delete", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_delete_user) {
            log(res.locals.config, state.db, req.session!.userID, "User", rs[0].id, "Delete", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const userID = req.session!.userID;
        await session_killer(state, rs[0].id);
        state.session_map[rs[0].id] = undefined;

        await state.db(res.locals.config.completely_delete_user ? query.deleteUserC : query.deleteUser, [rs[0].id]);

        log(res.locals.config, state.db, userID, "User", rs[0].id, "Delete", true, null);

        if (rs[0].id === userID) {
            res.json({
                code: 200,
                msg: "Delete Successfully",
                inf: "Your account is deleted",
            });
        }
        else {
            res.json({
                code: 200,
                msg: "Delete Successfully",
                inf: "The user just deleted will be logout",
            });
        }
    });
    return router;
};
