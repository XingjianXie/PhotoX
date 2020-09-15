export default class StateObject {
    session_map : any;
    db: (sql : string, values : any) => Promise<any>;
    constructor(session_map: any, db: (sql : string, values : any) => Promise<any>) {
        this.session_map = session_map
        this.db = db
    }
}