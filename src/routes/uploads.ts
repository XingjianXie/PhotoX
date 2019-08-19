import express from 'express';
import query from "../db/query";
import path from "path"
import createError from "http-errors";

export default (db : (sql : string, values : any) => Promise<any[]>) => {
    const router = express.Router();
    router.get('/:id.preview.jpg', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        if (isNaN(Number(req.params.id))) {
            next(createError(400, 'Photo ID Should Be A Number'));
            return;
        }
        const rs = await db(query.getPhotoById, [Number(req.params.id)]);
        if (!rs[0]) {
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (rs[0].type !== 1 && rs[0].type !== 2) {
            next(createError(404, 'Photo Not Found'));
            return;
        }
        if (rs[0].type === 1 && req.session.type <= rs[0].uploader_type && req.session.userID !== rs[0].uploader_id) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        //console.log(path.join(req.app.get('root'), "uploads", req.params.id + ".preview.jpg"));
        res.sendFile(path.join(req.app.get('root'), "uploads", req.params.id + ".preview.jpg"));
    });
    return router;
};
