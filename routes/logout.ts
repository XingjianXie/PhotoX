import express from 'express';
import query from "../db/query";

export default (session_map : any, db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        session_map[req.session.userID] = undefined;
        const id = req.session.userID;
        req.session.destroy((err) => {
            if (err) throw err;
            res.clearCookie('session');

            db(query.log, [id, "User", id, "Logout Out", true, null]);

            res.redirect('/login');
        });
    });
    return router;
};
