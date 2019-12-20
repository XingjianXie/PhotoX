import express from 'express';
import query from '../db/query';
import {make as ps_make, create as ps_create} from '../tools/password';
import createError from "http-errors";
import log from "../tools/log";
import os, {totalmem} from "os";

export default (db: (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', async(req, res) => {
        if (!req.session || !req.session.sign) {
            res.redirect('/');
            return;
        }
        const users = await db(query.allUser, []);
        const usersDeleted = await db(query.allDeletedUser, []);
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
            users,
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
    return router;
};
