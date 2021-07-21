import mysql from 'mysql';

const config = require('./DBConfig');
const pool = mysql.createPool(config);

export default (sql : string, values : any[]) =>
    new Promise<any>((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err);
            } else {
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