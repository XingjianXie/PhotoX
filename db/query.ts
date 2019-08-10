export default {
    //User
    addUser: 'INSERT INTO user(phone_number, name, type, passcode, passrd) VALUES(?,?,?,?,?)',
    queryUserWithLimit: 'SELECT * FROM user WHERE type <= ? AND deleted = 0 LIMIT ?,?',
    countQueryUserWithLimit: 'SELECT COUNT(*) FROM user WHERE type <= ? AND deleted = 0',
    getUserById: 'SELECT * FROM user WHERE id=? AND deleted = 0',
    getUserByPhoneNumber: 'SELECT * FROM user WHERE phone_number=? AND deleted = 0',
    searchUserWithLimited: 'SELECT * FROM user WHERE type <= ? AND (id=? OR phone_number=? OR name=?) AND deleted = 0 LIMIT ?,?',
    countSearchUserWithLimited: 'SELECT COUNT(*) FROM user WHERE type <= ? AND (id=? OR phone_number=? OR name=?) AND deleted = 0',
    resetPassword: 'UPDATE user SET passcode=?, passrd=? WHERE id=? AND deleted = 0',
    deleteUser: 'UPDATE user SET deleted = 1 WHERE id=? AND deleted = 0',
    resetUserType: 'UPDATE user SET type=? WHERE id=? AND deleted = 0',
    resetUserName: 'UPDATE user SET name=? WHERE id=? AND deleted = 0',
    resetUserPhoneNumber: 'UPDATE user SET phone_number=? WHERE id=? AND deleted = 0',


    //Photo
    addPhoto: 'INSERT INTO photo(uploader_id, type) VALUES(?, 0)',
    convertPhoto: 'UPDATE photo SET type=1 WHERE id=? AND deleted = 0',
    publishPhoto: 'UPDATE photo SET type=2, name=? WHERE id=? AND deleted = 0',
    getPhotoById: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE photo.id = ? AND photo.deleted = 0',
    getDownloadByPhotoId: 'SELECT * from download where photo_id = ?',
    deletePhoto: 'UPDATE photo SET deleted = 1 WHERE id = ?',

    queryUnPublishedPhotoWithLimit: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countQueryUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0',
    searchUnPublishedPhotoWithLimit: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countSearchUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0',

    queryPublishedPhotoWithLimit: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND photo.type = 2 AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countQueryPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0',
    searchPublishedPhotoWithLimit: 'SELECT photo.id as id, photo.type as type, photo.name as name, photo.uploader_id as uploader_id, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND photo.type = 2 AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countSearchPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE (user.type < ? OR user.id = ?) AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0',

    //Category
    queryCategory: 'SELECT category.id, category.name, owner, user.name AS owner_name, user.type AS owner_type, user.deleted AS owner_deleted FROM category LEFT OUTER JOIN user ON user.id=category.owner WHERE category.deleted = 0',

    //Log
    log: 'INSERT INTO log(operator, target_type, target, action, success, extra_message) VALUES(?, ?, ?, ?, ?, ?)',
    queryLogWithLimit: 'SELECT log.id, operator, operator_obj.name AS operator_name, target_type, target, COALESCE(targetP_obj.name, targetU_obj.name) AS target_name, action, success, extra_message FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ? ORDER BY log.id DESC LIMIT ?,?',
    countQueryLogWithLimit: 'SELECT COUNT(*) FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ?',
    searchLogWithLimit: 'SELECT log.id, operator, operator_obj.name AS operator_name, target_type, target, COALESCE(targetP_obj.name, targetU_obj.name) AS target_name, action, success, extra_message FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ? AND (POSITION(? IN log.id) OR POSITION(? IN COALESCE(targetP_obj.name, targetU_obj.name)) OR POSITION(? IN target) OR POSITION(? IN operator_obj.name) OR POSITION(? IN operator)) ORDER BY log.id DESC LIMIT ?,?',
    countSearchLogWithLimit: 'SELECT COUNT(*) FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ? AND (POSITION(? IN log.id) OR POSITION(? IN COALESCE(targetP_obj.name, targetU_obj.name)) OR POSITION(? IN target) OR POSITION(? IN operator_obj.name) OR POSITION(? IN operator))',
};