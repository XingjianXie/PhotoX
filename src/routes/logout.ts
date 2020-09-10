import express from 'express';
import query from "../db/query";
import log from "../tools/log";
import auth from "../tools/auth";

export default (session_map : any, db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        session_map[req.session!.userID] = undefined;
        const id : number = req.session!.userID;
        req.session!.destroy((err) => {
            if (err) throw err;
            res.clearCookie('session');

            log(res.locals.config, db, id, "User", id, "Logout", true, null);

            res.redirect('/login');
        });
    });
    return router;
};
