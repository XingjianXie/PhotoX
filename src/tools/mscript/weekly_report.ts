import query from "../../db/query";

export default (db: (sql : string, values : any) => Promise<any>, root: string) => {
    return {
        run: async() => {
            const weeklyReport = await db(query.weeklyReport, [])
            let res: string[] = []
            let dic: any = {}
            for (const i of weeklyReport) {
                if (!dic[i.operator]) {
                    dic[i.operator] = {
                        count: 1,
                        name: i.name
                    }
                } else {
                    dic[i.operator].count++
                }
            }
            res.push("<b>Weekly Report:</b>")
            for (const i in dic) {
                res.push("User " + dic[i].name + " (" + i + "): " + dic[i].count)
            }
            console.log("weekly_report run")
            return res.join("<br>")
        },
        callback: async() => {
            console.log("weekly_rep callback")
        },
    }
}