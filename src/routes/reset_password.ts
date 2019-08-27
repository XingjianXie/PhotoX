import express from 'express';
import query from '../db/query';
import {make as ps_make, create as ps_create} from '../tools/password';
import createError from "http-errors";

export default (session_map : any, db: (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', (req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        res.render("reset_password", { pre: req.query.id });
    });
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }
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
                db(query.log, [req.session.userID, "User", Number(req.body.id), "Reset Password", false, "Error: Unauthorized"]);
                next(createError(401, 'Unauthorized'));
                return;
            }
            id = Number(req.body.id);
        } else {
            if (req.body.id) {
                db(query.log, [req.session.userID, "User", Number(req.body.id), "Reset Password", false, "Error: Unauthorized"]);
                next(createError(401, 'Unauthorized'));
                return;
            }
            if (!req.body.pwd_old) {
                db(query.log, [req.session.userID, "User", req.session.userID, "Reset Password", false, "Error: Bad Request"]);
                next(createError(400, 'Old Password Required'));
                return;
            }
            id = req.session.userID;
        }
        if (!req.body.pwd_new) {
            db(query.log, [req.session.userID, "User", id, "Reset Password", false, "Error: Bad Request"]);
            next(createError(400, 'New Password Required'));
            return;
        }

        const rs = await db(query.getUserById, [id]);
        if (!rs.length) {
            db(query.log, [req.session.userID, "User", id, "Reset Password", false, "Error: User Not Found"]);
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type > rs[0].type || ps_make(req.body.pwd_old, rs[0].passrd) === rs[0].passcode) {
            const ps_new = ps_create(req.body.pwd_new);
            await db(query.resetPassword, [ ps_new[0], ps_new[1], id]);
            const userID = req.session.userID;
            await new Promise(async (resolve, reject) => {
                req.sessionStore!.destroy((await session_map[id]), (err) => {
                    if(err) reject(err);
                    else resolve();
                });
            });
            session_map[id] = undefined;

            db(query.log, [userID, "User", id, "Reset Password", true, null]);

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
            db(query.log, [req.session.userID, "User", id, "Reset Password", false, "Error: Unauthorized"]);
            next(createError(401, 'Password or Permission Unauthorized'));
        }
    });
    return router;
};
