import express from 'express';
import query from "../db/query";
import log from "../tools/api/log";
import auth from "../tools/api/auth";
import StateObject from "../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        state.session_map[req.session!.userID] = undefined;
        const id : number = req.session!.userID;
        req.session!.destroy((err) => {
            if (err) throw err;
            res.clearCookie('session');

            log(res.locals.config, state.db, id, "User", id, "Logout", true, null);

            res.json({
                code: 302,
                url: "/",
            })
        });
    });
    return router;
};
