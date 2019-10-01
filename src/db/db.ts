import mysql from 'mysql';
import query from "./query";
import {AllHtmlEntities} from "html-entities";

const config = require('./DBConfig');
const pool = mysql.createPool(config);

export default (sql : string, values : string[]) =>
    new Promise<any>((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err);
            } else {
                //console.log(connection.format(sql, values));
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                })
            }
        })
    });