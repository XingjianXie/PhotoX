import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import StateObject from "../../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.use('/:name', async(req, res, next) => {
        const rs : any[] = await state.db(query.getDeletableConfigByName, [req.params.name]);
        if (!rs[0]) {
            next(createError(404, 'Config Not Found'));
            return;
        }

        await state.db(query.deleteConfig, [rs[0].name]);

        res.json({
            code: 200,
            msg: "Delete Successfully",
        });
    });
    return router;
};
