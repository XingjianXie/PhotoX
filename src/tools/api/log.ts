import query from "../../db/query";

export = async(config: any, db: (sql : string, values : any) => Promise<any>, operator: number, target_type: string, target: number | null, action: string, success: boolean, extra_message: string | null) => {
    if (!config.disable_log)
        await db(query.log, [operator, target_type, target, action + " API", success, true, extra_message]);
}