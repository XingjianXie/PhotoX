import express from 'express';
import createError from "http-errors";
import query from "../../db/query";
import log from "../../tools/log";
import auth from "../../tools/api/auth";
import StateObject from "../../class/state_object";
import session_killer from "../../tools/session_killer";

export default (state: StateObject) => {
    let router = express.Router();
    router.post('/', async(req, res, next) => {
        if (isNaN(Number(req.body.userID))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs : any[] = await state.db(query.getUserById, [Number(req.body.userID)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session!.userID, "User", Number(req.params.id), "Kick Out", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session!.type <= rs[0].type && req.session!.userID !== rs[0].id) {
            log(res.locals.config, state.db, req.session!.userID, "User", rs[0].id, "Kick Out", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            log(res.locals.config, state.db, req.session!.userID, "User", rs[0].id, "Kick Out", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_kick_user) {
            log(res.locals.config, state.db, req.session!.userID, "User", rs[0].id, "Kick Out", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const userID = req.session!.userID;
        await session_killer(state, rs[0].id);
        state.session_map[rs[0].id] = undefined;

        log(res.locals.config, state.db, userID, "User", rs[0].id, "Kick Out", true, null);

        res.status(200);
        if (rs[0].id === userID) {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Logout Successfully",
                inf: "Your are logout now",
                home: true
            });
        }
        else {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Logout Successfully",
            });
        }
    });
    return router;
};
