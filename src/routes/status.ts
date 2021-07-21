import express from 'express';
import query from '../db/query';
import {make as ps_make, create as ps_create} from '../tools/password';
import createError from "http-errors";
import log from "../tools/log";
import os, {totalmem} from "os";
import path from "path";
import auth from "../tools/auth";
import StateObject from "../class/state_object";

export default (state: StateObject) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        const usersDeleted = await state.db(query.allDeletedUser, []);
        const usersLength = (await state.db(query.allUser, [])).length - usersDeleted.length;
        const photosPublished = await state.db(query.allPublishedPhoto, []);
        const photosUnpublished = await state.db(query.allUnpublishedPhoto, []);
        const photosUnconverted = await state.db(query.allUnconvertedPhoto, []);
        const photosDeleted = await state.db(query.allDeletedPhoto, []);
        const sysMem = {free: os.freemem(), total: os.totalmem()};
        const nodeMem = {used: process.memoryUsage().heapUsed, total: process.memoryUsage().heapTotal};
        const minn = os.loadavg();
        const allLogs = await state.db(query.allLog, []);
        const successLogs = await state.db(query.allSuccessLog, []);
        const failLogs = await state.db(query.allFailLog, []);
        res.render("status", {
            usersLength,
            usersDeleted,
            photosPublished,
            photosUnpublished,
            photosUnconverted,
            photosDeleted,
            sysMemUsed: sysMem.total - sysMem.free,
            sysMemAvailable: sysMem.free,
            nodeMemUsed: nodeMem.used,
            nodeMemAvailable: nodeMem.total - nodeMem.used,
            min1: minn[0],
            min5: minn[1],
            min15: minn[2],
            allLogs,
            successLogs,
            failLogs,
        });
    });
    router.post('/run/:name', async(req, res, next) => {
        if (!req.params.name) {
            next(createError(400, 'Script Required'));
            return;
        }
        if (req.params.name.includes(".")) {
            next(createError(400, 'Script Name Should Not Include "."'));
            return;
        }

        if (req.body.confirm === '1' && !res.locals.config.disable_dangerous_action_confirm) {
            let data1 = req.body;
            data1.confirm = '0';
            res.render('confirm', {
                msg: 'Run Script Confirmation',
                inf1: 'Are you sure to run this script?',
                inf2: 'PLEASE ENSURE YOU KNOW WHAT YOU ARE DOING',
                data: data1
            });
            return;
        }

        const script = (await import(path.join("../tools/mscript/", encodeURIComponent(req.params.name)))).default(state.db, req.app.get('root'))
        console.log(script)

        await state.db(query.maintenance, ["true"]);
        //=========aha==========
        const result = await script.run();
        await state.db(query.addMessage, [0, null,
            "Script " + encodeURIComponent(req.params.name) + " has been run by " + req.session.name + " (" + req.session.userID + "). " + "<br>"
            + '<a href="#" onclick="$(this.nextElementSibling.nextElementSibling).collapse(\'toggle\'); return false;">Result</a><br>'
            + '<div class="collapse">'
            + result
            + '</div>'
        ])
        //=========aha==========
        await state.db(query.maintenance, ["false"]);
        await script.callback();

        res.render('notification', {
            code: 200,
            msg: "Script Finished",
            inf: '<a href="#result" data-toggle="collapse">Result</a><br>' +
                '<div id="result" class="collapse">' +
                result +
                '</div>',
        });
    })
    return router;
};
