import express from 'express';
import {MemoryStore} from "express-session";
import query from "../../../db/query";
import createError from "http-errors";
import log from "../../../tools/log"
import auth from "../../../tools/api/auth";
import StateObject from "../../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.use('/:id', async(req, res, next) => {
        if (isNaN(Number(req.params.id)) || Number(req.params.id) === 0) {
            next(createError(400, 'Category ID Should Be A Nonzero Number'));
            return;
        }
        let rs = await state.db(query.getCategoryById, [Number(req.params.id)]);
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

        await state.db(query.moveCategory, [0, rs[0].id]);
        await state.db(query.deleteCategory, [rs[0].id]);

        res.json({
            code: 200,
            msg: "Delete Successfully",
        });
    });
    return router;
};
