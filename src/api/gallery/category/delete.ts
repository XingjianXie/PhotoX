import express from 'express';
import {MemoryStore} from "express-session";
import query from "../../../db/query";
import createError from "http-errors";
import log from "../../../tools/log"
import auth from "../../../tools/api/auth";
import StateObject from "../../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.post('/', async(req, res, next) => {
        if (isNaN(Number(req.body.categoryId)) || Number(req.body.categoryId) === 0) {
            next(createError(400, 'Category ID Should Be A Nonzero Number'));
            return;
        }
        let rs = await state.db(query.getCategoryById, [Number(req.body.categoryId)]);
        if (!rs[0]) {
            log(res.locals.config, state.db, req.session!.userID, "Category", Number(req.body.categoryId), "Delete", false, "Error: Not Found");
            next(createError(404, 'Category Not Found'));
            return;
        }
        if (req.session!.type <= rs[0].owner_type && req.session!.userID !== Number(rs[0].owner)) {
            log(res.locals.config, state.db, req.session!.userID, "Category", rs[0].id, "Delete", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_delete_category) {
            log(res.locals.config, state.db, req.session!.userID, "Category", rs[0].id, "Delete", false, "Error: Disabled");
            next(createError(400, 'Disabled'));
            return;
        }
        if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
            let num : number = (await state.db(query.countPhotoSpecificCategory, [rs[0].id]))[0]["COUNT(*)"];
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Delete Confirmation',
                inf1: 'Are you sure to delete category ' + rs[0].name + ' (' + rs[0].id.toString() + ')',
                inf2: !num ? '' : '[ASK MARK XIE BEFORE YOU DO THIS] YOU MAY NOT UNDO THIS ACTION: ALL PHOTOS(' + num.toString() + ') WHICH HAS THIS CATEGORY WILL BE MOVED TO DEFAULT CATEGORY',
                data: data1
            });
            return;
        }

        await state.db(query.moveCategory, [0, rs[0].id]);
        await state.db(query.deleteCategory, [rs[0].id]);

        res.render('notification', {
            code: 200,
            msg: "Delete Successfully",
        });
    });
    return router;
};
