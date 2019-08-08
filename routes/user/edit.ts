import express = require('express');
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (session_map: any, db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.params.id)]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "User", Number(req.params.id), "Edit", false, "Error: User Not Found"]);
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type <= rs[0].type && req.session.userID !== Number(req.params.id)) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        res.render('edit_user', { u: rs[0] });
    });

    router.post('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.type && isNaN(Number(req.body.type)) || (Number(req.body.type)) > 126 || (Number(req.body.type)) < 0) {
            next(createError(400, 'Type Should Be A Number From 0 to 126'));
            return;
        }
        if (req.body.phone_number && isNaN(Number(req.body.phone_number)) || Number(req.body.phone_number).toString().length !== 11) {
            next(createError(400, 'Phone Number Invalid'));
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getUserById, [Number(req.params.id)]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "User", Number(req.params.id), "Edit", false, "Error: User Not Found"]);
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type <= rs[0].type && req.session.userID !== rs[0].id) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.session.type < Number(req.body.type)) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Edit", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.name && !req.body.type && !req.body.phone_number) {
            db(query.log, [req.session.userID, "User", rs[0].id, "Edit", false, "Error: Bad Request"]);
            next(createError(400, 'Type or Name Required'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            if(req.session.userID === rs[0].id && Number(req.body.type) < req.session.type) {
                res.render('confirm', {
                    msg: 'Edit User Confirmation',
                    inf1: 'Are you sure to downgrade your type?',
                    inf2: 'YOU MAY NOT UNDO THIS ACTION',
                    data: data1
                });
                return;
            }
            else if(req.session.userID !== rs[0].id && Number(req.body.type) === req.session.type) {
                res.render('confirm', {
                    msg: 'Edit User Confirmation',
                    inf1: 'Are you sure to make ' + rs[0].name + ' (' + res.locals.typeName[rs[0].type] + ') have the same type with you?',
                    inf2: 'YOU MAY NOT UNDO THIS ACTION',
                    data: data1
                });
                return;
            }
        }
        const userID = req.session.userID;
        await new Promise(async (resolve, reject) => {
            req.sessionStore!.destroy((await session_map[rs[0].id]), (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        session_map[rs[0].id] = undefined;


        if (req.body.type) {
            await db(query.resetUserType, [Number(req.body.type), rs[0].id]);
            db(query.log, [userID, "User", rs[0].id, "Reset Type", true, "Previous Type: " + res.locals.typeName[rs[0].type]]);
        }
        if (req.body.name) {
            await db(query.resetUserName, [req.body.name, rs[0].id]);
            db(query.log, [userID, "User", rs[0].id, "Reset Name", true, "Previous Name: " + rs[0].name]);
        }
        try {
            if (req.body.phone_number) {
                await db(query.resetUserPhoneNumber, [req.body.phone_number, rs[0].id]);
                db(query.log, [userID, "User", rs[0].id, "Reset Phone Number", true, "Previous Phone Number: " + rs[0].phone_number]);
            }
            if (rs[0].id === userID) {
                res.status(200);
                res.render('message', {
                    code: 200,
                    msg: "Update Successfully",
                    inf: "Please login again",
                    home: true
                });
            }
            else {
                res.status(200);
                res.render('message', {
                    code: 200,
                    msg: "Update Successfully",
                    inf: "The user just edited will be logout",
                });
            }
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                db(query.log, [userID, "User", rs[0].id, "Reset Phone Number", false, "Error: Duplicate"]);
                next(createError(400, 'Phone Number Has Been Taken'));
            } else throw e;
        }
    });

    return router;
};
