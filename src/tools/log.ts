import query from "../db/query";

export = async(config: any, db: (sql : string, values : any) => Promise<any>, operator: number, target_type: string, target: number | null, action: string, success: boolean, extra_message: string | null) => {
    if (!config.disable_log)
        db(query.log, [operator, target_type, target, action, success, extra_message]);
}