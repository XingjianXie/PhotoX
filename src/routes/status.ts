import express from 'express';
import query from '../db/query';
import {make as ps_make, create as ps_create} from '../tools/password';
import createError from "http-errors";
import log from "../tools/log";
import os, {totalmem} from "os";
import path from "path";

export default (db: (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        const usersDeleted = await db(query.allDeletedUser, []);
        const usersLength = (await db(query.allUser, [])).length - usersDeleted.length;
        const photosPublished = await db(query.allPublishedPhoto, []);
        const photosUnpublished = await db(query.allUnpublishedPhoto, []);
        const photosUnconverted = await db(query.allUnconvertedPhoto, []);
        const photosDeleted = await db(query.allDeletedPhoto, []);
        const sysMem = {free: os.freemem(), total: os.totalmem()};
        const nodeMem = {used: process.memoryUsage().heapUsed, total: process.memoryUsage().heapTotal};
        const minn = os.loadavg();
        const allLogs = await db(query.allLog, []);
        const successLogs = await db(query.allSuccessLog, []);
        const failLogs = await db(query.allFailLog, []);
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
        if (!req.session || !req.session.sign) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.params.name) {
            next(createError(400, 'Script Required'));
            return;
        }
        if (req.params.name.includes(".")) {
            next(createError(400, 'Script Name Should Not Include "."'));
            return;
        }

        const script = (await import(path.join("../tools/mscript/", encodeURIComponent(req.params.name)))).default(db)
        console.log(script)

        await db(query.maintenance, [true]);
        //=========aha==========
        const result = await script.run();
        await db(query.addMessage, [0, null,
            "Script " + encodeURIComponent(req.params.name) + " has been run by " + req.session.name + " (" + req.session.userID + "). " + "<br>"
            + "The result is: " + result
        ])
        //=========aha==========
        await db(query.maintenance, [false]);
        await script.callback();

        res.render('notification', {
            code: 200,
            msg: "Script Finished",
            inf: "Result: " + result,
        });
    })
    return router;
};