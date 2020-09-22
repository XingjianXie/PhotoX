import {RedisClient} from "redis";

export default class StateObject {
    session_map : any;
    redis: RedisClient;
    db: (sql : string, values : any) => Promise<any>;
    constructor(session_map: any, db: (sql : string, values : any) => Promise<any>, redis: RedisClient) {
        this.session_map = session_map
        this.db = db
        this.redis = redis
    }
}