import express from 'express';
import query from '../db/query';
import {create as ps_create, make as ps_make} from '../tools/password';
import createError from "http-errors";
import log from "../tools/log";
import upload_photo from '../tools/upload_photo';
import auth from "../tools/auth";
import StateObject from "../class/state_object";
import multer from "multer";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', (req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        if (!res.locals.config.allow_guest_upload) {
            next(createError(401, 'Disabled'));
            return;
        }
        res.render("guest_upload");
    });
    router.post('/', async(req, res, next) => {
        if (!auth(req, res, next, "redirect", "nologin")) return;
        if (!req.body.phone_number) {
            next(createError(400, 'Phone Number Required'));
            return;
        }
        if (!req.body.name) {
            next(createError(400, 'Password Required'));
            return;
        }
        if (!req.body.secret) {
            next(createError(400, 'Secret Required'));
            return;
        }
        if (isNaN(Number(req.body.phone_number)) || Number(req.body.phone_number).toString().length != 11) {
            next(createError(400, 'Phone Number Invalid'));
            return;
        }
        if (!res.locals.config.allow_guest_upload) {
            next(createError(401, 'Disabled'));
            return;
        }
        if (req.body.secret !== res.locals.config.guest_upload_secret) {
            next(createError(401, 'Secret Unauthorized'));
            return;
        }

        const rs = await state.db(query.getUserByPhoneNumber, [req.body.phone_number]);
        if (rs[0]) {
            if (rs[0].type !== 126) {
                log(res.locals.config, state.db, 0, "User", null, "Guest Upload", false, "Error: Phone Number Used");
                next(createError(400, 'Phone Number Has Been Taken as Staff Account'));
                return;
            }
            req.session!.guestUploadUserID = rs[0].id;
            req.session!.guestUploadLogin = true;
            log(res.locals.config, state.db, 0, "User", rs[0].id, "Guest Upload (Previous)", true, null);
        } else {
            const id : number = (await state.db(query.addUser, [req.body.phone_number, req.body.name, 126, null, null])).insertId;
            log(res.locals.config, state.db, 0, "User", id, "Guest Upload (New)", true, null);

            req.session!.guestUploadUserID = id;
            req.session!.guestUploadLogin = true;
        }
        res.sendStatus(200);
    });
    router.post('/upload', multer({limits: {fileSize: 1e8}}).array("photo", 20), async(req, res, next) => {
        if (!req.session || !req.session!.guestUploadLogin) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!(req.files instanceof Array)) {
            throw req.files;
        }
        const t = await upload_photo(res.locals.config, state.db, req.files, req.session!.guestUploadUserID, req.app.get("root"));
        req.session!.destroy((err) => {
            if (err) throw err;
            res.send(t);
        });
    });
    return router;
};
