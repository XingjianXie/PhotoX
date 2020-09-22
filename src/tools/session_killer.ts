import StateObject from "../class/state_object";

export default async function(state: StateObject, id: number) {
    return await new Promise(async (resolve, reject) => {
        let key = await state.session_map[id];
        if (key !== null) {
            state.redis.del(key, (err) => {
                if(err) reject(err);
                else resolve();
            });
        } else {
            resolve();
        }
    });
}