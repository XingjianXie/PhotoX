import express from 'express';
import query from "../db/query";
import path from "path"
import createError from "http-errors";
import auth from "../tools/api/auth";
import StateObject from "../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/:id.preview.jpg', async(req, res, next) => {
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        if (Number(req.params.id) !== res.locals.config.bg1
         && Number(req.params.id) !== res.locals.config.bg2
         && Number(req.params.id) !== res.locals.config.bg3) {
            if (!auth(req, res, next, "redirect", "sign")) return;
            if ((await state.db(query.getSpPreview, [req.session.userID, Number(req.params.id)])).length) {
                res.sendFile(path.join(req.app.get('root'), "uploads", req.params.id + ".preview.jpg"));
                return;
            }
            const rs : any[] = await state.db(query.getPhotoById, [Number(req.params.id)]);
            if (!rs[0]) {
                next(createError(404, 'Photo Not Found'));
                return;
            }
            if (rs[0].type !== 1 && rs[0].type !== 2) {
                next(createError(404, 'Photo Not Found'));
                return;
            }
            if (rs[0].type === 1 && !res.locals.config.allow_publish_others && req.session.userID !== rs[0].uploader_id) {
                next(createError(401, 'Unauthorized'));
                return;
            }
        }
        res.sendFile(path.join(req.app.get('root'), "uploads", req.params.id + ".preview.jpg"));
    });
    router.get('/:uuid/:id.jpg', async(req, res, next) => {
        if (!auth(req, res, next, "redirect", "sign")) return;
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        const rs : any[] = await state.db(query.download, [req.params.uuid, req.session.userID, Number(req.params.id)]);
        if (!rs[0]) {
            next(createError(404, 'Photo Not Found'));
            return;
        }
        res.sendFile(path.join(req.app.get('root'), "uploads", req.params.id + ".jpg"));
    });
    return router;
};
