import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const rs = await db(query.getPhotoById, [Number(req.body.photoID)]);
        if (!rs[0]) {
            db(query.log, [req.session.userID, "Photo", Number(req.body.photoID), "Delete", false, "Error: Photo Not Found"]);
            next(createError(404, 'Photo Not Found'));
            return;
        }
        const dw = await db(query.getDownloadByPhotoId, [Number(req.body.photoID)]);
        if (req.session.type <= rs[0].uploader_type && (req.session.userID !== rs[0].uploader_id || (dw.length && !req.session.type))) {
            db(query.log, [req.session.userID, "Photo", rs[0].id, "Delete", false, "Error: Unauthorized"]);
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (req.body.confirm === '1') {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Delete Confirmation',
                inf1: 'Are you sure to delete photo ' + rs[0].id.toString() + '?',
                inf2: 'YOU MAY NOT UNDO THIS ACTION',
                data: data1
            });
            return;
        }

        await db(query.deletePhoto, [rs[0].id]);
        await db(query.clearMark, [rs[0].id]);
        const recall_notification = await db(query.getDownloadByPhotoId, [rs[0].id]);
        for (const val of recall_notification) {
            await db(query.addSpPreview, [val.user, rs[0].id]);
            await db(query.addMessage, [0, val.user,
                (
                    "The photo you downloaded has been deleted by "+ req.session.name + " (" + req.session.userID + "). " + "<br>"
                    + '<div class="bkimg rounded" style="background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
                )
            ]);
        }
        await db(query.addSpPreview, [rs[0].uploader_id, rs[0].id]);
        await db(query.addMessage, [0, rs[0].uploader_id,
            (
                "The photo you uploaded has been deleted by "+ req.session.name + " (" + req.session.userID + "). " + "<br>"
                + '<div class="bkimg rounded" style="background-image: url(/uploads/' + rs[0].id + '.preview.jpg); background-size: 100%" rel-height="' + rs[0].height + '" rel-width="' + rs[0].width + '"> </div>'
            )
        ]);

        db(query.log, [req.session.userID, "Photo", rs[0].id, "Delete", true, null]);

        res.status(200);
        if (dw.length) {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Delete Successfully",
                inf: "The user download this photo will be noticed",
            });
        }
        else {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Delete Successfully",
            });
        }
    });

    return router;
};
