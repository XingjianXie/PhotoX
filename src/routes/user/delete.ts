import express from 'express';
import {MemoryStore} from "express-session";
import query from "../../db/query";
import createError from "http-errors";
import log from "../../tools/log";

export default (session_map : any, db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.userID))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs : any[] = await db(query.getUserById, [Number(req.body.userID)]);
        if (!rs[0]) {
            log(res.locals.config, db, req.session.userID, "User", Number(req.body.userID), "Delete", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.body.userID)) {
            log(res.locals.config, db, req.session.userID, "User", rs[0].id, "Delete", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            log(res.locals.config, db, req.session.userID, "User", rs[0].id, "Delete", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_delete_user) {
            log(res.locals.config, db, req.session.userID, "User", rs[0].id, "Delete", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
            let data1 = req.body;
            data1.confirm = '0';
            if(req.session.userID === Number(req.body.userID))
                res.render('confirm', {
                    msg: 'Delete Confirmation',
                    inf1: 'Are you sure to delete your own user?',
                    inf2: res.locals.config.completely_delete_user ?
                        'YOU MAY NOT UNDO THIS ACTION: PHOTO ON IT\'S UPLOAD CENTER WILL BE GONE':
                        'YOU MAY NOT UNDO THIS ACTION: YOU MAY NOT USE ITS PHONE NUMBER TO SIGN UP',
                    data: data1
                });
            else
                res.render('confirm', {
                    msg: 'Delete Confirmation',
                    inf1: 'Are you sure to delete ' + res.locals.typeName[rs[0].type] + ' ' + rs[0].name + ' (' + rs[0].id + ')?',
                    inf2: res.locals.config.completely_delete_user ?
                        'YOU MAY NOT UNDO THIS ACTION: PHOTO ON IT\'S UPLOAD CENTER WILL BE GONE':
                        'YOU MAY NOT UNDO THIS ACTION: YOU MAY NOT USE ITS PHONE NUMBER TO SIGN UP',
                    data: data1
                });
            return;
        }
        const userID = req.session.userID;
        await new Promise(async (resolve, reject) => {
            req.sessionStore!.destroy((await session_map[rs[0].id]), (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        session_map[rs[0].id] = undefined;

        await db(res.locals.config.completely_delete_user ? query.deleteUserC : query.deleteUser, [rs[0].id]);

        log(res.locals.config, db, userID, "User", rs[0].id, "Delete", true, null);

        if (rs[0].id === userID) {
            res.render('notification', {
                code: 200,
                msg: "Delete Successfully",
                inf: "Your account is deleted",
                home: true
            });
        }
        else {
            res.render('notification', {
                code: 200,
                msg: "Delete Successfully",
                inf: "The user just deleted will be logout",
            });
        }
    });
    return router;
};
