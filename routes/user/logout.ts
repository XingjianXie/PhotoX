import express = require('express');
import createError from "http-errors";
import query from "../../db/query";

export default (session_map : any, db : (sql : string, values : any) => Promise<any>) => {
    let router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.userID))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.body.userID)]);
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.body.userID)) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Kick Out", false, "Reason: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Kick Out", false, "Reason: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        await new Promise(async (resolve, reject) => {
            req.sessionStore!.destroy((await session_map[Number(req.body.userID)]), (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        session_map[req.body.userID] = undefined;

        db(query.log, [req.session.userID, "User", rs[0].id, "Kick Out", true, null]);

        res.status(200);
        if (Number(req.body.userID) === req.session.userID) {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Logout Successfully",
                inf: "Your are logout now",
                home: true
            });
        }
        else {
            res.status(200);
            res.render('message', {
                code: 200,
                msg: "Logout Successfully",
            });
        }
    });
    return router;
};
