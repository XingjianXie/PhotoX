export default {
    //User
    addUser: 'INSERT INTO user(phone_number, name, type, passcode, passrd) VALUES(?,?,?,?,?)',
    getUserById: 'SELECT * FROM user WHERE id=? AND deleted = 0',
    getUserByPhoneNumber: 'SELECT * FROM user WHERE phone_number=? AND deleted = 0',
    queryUserWithLimit: 'SELECT * FROM user WHERE type <= ? AND deleted = 0 LIMIT ?,?',
    countQueryUserWithLimit: 'SELECT COUNT(*) FROM user WHERE type <= ? AND deleted = 0',
    searchUserWithLimited: 'SELECT * FROM user WHERE type <= ? AND (id=? OR phone_number=? OR name=?) AND deleted = 0 LIMIT ?,?',
    countSearchUserWithLimited: 'SELECT COUNT(*) FROM user WHERE type <= ? AND (id=? OR phone_number=? OR name=?) AND deleted = 0',
    resetPassword: 'UPDATE user SET passcode=?, passrd=? WHERE id=? AND deleted = 0',
    deleteUser: 'UPDATE user SET deleted = 1 WHERE id=? AND deleted = 0',
    resetUserType: 'UPDATE user SET type=? WHERE id=? AND deleted = 0',
    resetUserName: 'UPDATE user SET name=? WHERE id=? AND deleted = 0',
    resetUserPhoneNumber: 'UPDATE user SET phone_number=? WHERE id=? AND deleted = 0',


    //Photo
    addPhoto: 'INSERT INTO photo(uploader_id, md5, type) VALUES(?, ?, 0)',
    convertPhoto: 'UPDATE photo SET type=1, height=?, width=?, exif_time=FROM_UNIXTIME(?) WHERE id=? AND deleted = 0',
    publishPhoto: 'UPDATE photo SET type=2, name=?, category=? WHERE id=? AND type=1 AND deleted = 0',
    getPhotoById: 'SELECT photo.*, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE photo.id = ? AND photo.deleted = 0',
    getPublishedPhotoById: 'SELECT photo.*, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE photo.id = ? AND photo.type = 2 AND photo.deleted = 0',
    getPhotoByMd5: 'SELECT photo.*, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE photo.md5 = ? AND photo.deleted = 0',
    deletePhoto: 'UPDATE photo SET deleted = 1, md5=NULL WHERE id = ?',
    recallPhoto: 'UPDATE photo SET type = 1 WHERE id = ? AND type=2',

    countUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo WHERE photo.uploader_id = ? AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0',
    queryUnPublishedPhotoWithLimit: 'SELECT photo.*, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE user.id = ? AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countQueryUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE user.id = ? AND (photo.type = 0 OR photo.type = 1) AND photo.deleted = 0',
    searchUnPublishedPhotoWithLimit: 'SELECT photo.*, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE user.id = ? AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countSearchUnPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE user.id = ? AND (photo.type = 0 OR photo.type = 1) AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0',

    queryPublishedPhotoWithLimit: 'SELECT photo.*, category.name as category_name, category.owner as category_owner, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id LEFT OUTER JOIN category ON photo.category=category.id WHERE photo.type = 2 AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countQueryPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE photo.type = 2 AND photo.deleted = 0',
    searchPublishedPhotoWithLimit: 'SELECT photo.*, category.name as category_name, category.owner as category_owner, user.type as uploader_type, user.name as uploader_name, user.deleted as uploader_deleted FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id LEFT OUTER JOIN category ON photo.category=category.id WHERE photo.type = 2 AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0 ORDER BY photo.id DESC LIMIT ?,?',
    countSearchPublishedPhotoWithLimit: 'SELECT COUNT(*) FROM photo LEFT OUTER JOIN user ON user.id = photo.uploader_id WHERE AND photo.type = 2 AND (POSITION(? IN user.name) OR POSITION(? IN user.id) OR POSITION(? IN photo.id)) AND photo.deleted = 0',

    //Download
    addDownload: 'INSERT INTO download values(UUID(), ?, ?)',
    getDownloadByPhotoId: 'SELECT download.*, user.name AS user_name from download LEFT OUTER JOIN user ON user.id=download.user where photo = ?',
    isDownloadedByUser: 'SELECT * FROM download where user=? and photo=?',
    download: 'SELECT * FROM download where uuid=? and user=? and photo=?',
    removeDownload: 'DELETE FROM download WHERE user=? and photo=?',
    clearDownload: 'DELETE FROM download WHERE photo=?',

    //Message
    addMessage: 'INSERT INTO message(`from`, `to`, `content`) values(?, ?, ?)',
    countMyUnreadMessage: 'SELECT message.* FROM `message` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE (`to`=? OR `to` IS NULL) AND (read.user IS NULL) AND (message.id=?)',
    queryMyMessageWithLimit: 'SELECT message.*, user.name AS from_name, `read`.message AS `read` FROM `message` LEFT OUTER JOIN user ON user.id=message.`from` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE `to`=? OR `to` IS NULL ORDER BY (`read` IS NOT NULL), id DESC LIMIT ?,?',
    countQueryMyMessageWithLimit: 'SELECT COUNT(*) FROM `message` LEFT OUTER JOIN user ON user.id=message.`from` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE `to`=? OR `to` IS NULL',
    queryMyUnreadMessage: 'SELECT message.* FROM `message` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE (`to`=? OR `to` IS NULL) AND (read.user IS NULL)',
    countQueryMyUnreadMessage: 'SELECT COUNT(*) FROM `message` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE (`to`=? OR `to` IS NULL) AND (read.user IS NULL)',
    searchMyMessageWithLimit: 'SELECT message.*, user.name AS from_name, `read`.message AS `read` FROM `message` LEFT OUTER JOIN user ON user.id=message.`from` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE (`to`=? OR `to` IS NULL) AND (POSITION(? IN user.name) OR POSITION(? IN message.`from`) OR POSITION(? IN `content`) OR POSITION(? IN message.id)) ORDER BY (`read` IS NOT NULL), id DESC LIMIT ?,?',
    countSearchMyMessageWithLimit: 'SELECT COUNT(*) FROM `message` LEFT OUTER JOIN user ON user.id=message.`from` LEFT OUTER JOIN `read` ON message.id=`read`.message AND read.user=? WHERE (`to`=? OR `to` IS NULL) AND (POSITION(? IN user.name) OR POSITION(? IN message.`from`) OR POSITION(? IN `content`) OR POSITION(? IN message.id))',

    querySentMessageWithLimit: 'SELECT message.*, user.name AS to_name FROM `message` LEFT OUTER JOIN user ON user.id=message.`to` WHERE `from`=? ORDER BY id DESC LIMIT ?,?',
    countQuerySentMessageWithLimit: 'SELECT COUNT(*) FROM `message` LEFT OUTER JOIN user ON user.id=message.`to` WHERE `from`=?',
    searchSentMessageWithLimit: 'SELECT message.*, user.name AS to_name FROM `message` LEFT OUTER JOIN user ON user.id=message.`to` WHERE `from`=? AND (POSITION(? IN user.name) OR POSITION(? IN message.`to`) OR POSITION(? IN `content`) OR POSITION(? IN message.id)) ORDER BY id DESC LIMIT ?,?',
    countSearchSentMessageWithLimit: 'SELECT COUNT(*) FROM `message` LEFT OUTER JOIN user ON user.id=message.`to` WHERE `from`=? AND (POSITION(? IN user.name) OR POSITION(? IN message.`to`) OR POSITION(? IN `content`) OR POSITION(? IN message.id))',


    //Read
    readMessage: 'INSERT INTO `read`(user, message) values(?,?)',

    //Category
    queryCategory: 'SELECT category.*, owner, user.name AS owner_name, user.type AS owner_type, user.deleted AS owner_deleted FROM category LEFT OUTER JOIN user ON user.id=category.owner WHERE category.deleted = 0',

    //Mark
    addMark: 'INSERT INTO mark values(?, ?)',
    getMarkByPhotoId : 'SELECT * FROM mark WHERE photo_id=?',
    clearMark: 'DELETE FROM mark WHERE photo_id=?',

    //Log
    log: 'INSERT INTO log(operator, target_type, target, action, success, extra_message) VALUES(?, ?, ?, ?, ?, ?)',
    queryLogWithLimit: 'SELECT log.*, operator_obj.name AS operator_name, target_type, target, COALESCE(targetP_obj.name, targetU_obj.name, "Message") AS target_name, action, success, extra_message FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ? ORDER BY log.id DESC LIMIT ?,?',
    countQueryLogWithLimit: 'SELECT COUNT(*) FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ?',
    searchLogWithLimit: 'SELECT log.*, operator_obj.name AS operator_name, target_type, target, COALESCE(targetP_obj.name, targetU_obj.name, "Message") AS target_name, action, success, extra_message FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ? AND (POSITION(? IN log.id) OR POSITION(? IN COALESCE(targetP_obj.name, targetU_obj.name)) OR POSITION(? IN target) OR POSITION(? IN operator_obj.name) OR POSITION(? IN operator) OR POSITION(? IN action)) ORDER BY log.id DESC LIMIT ?,?',
    countSearchLogWithLimit: 'SELECT COUNT(*) FROM log LEFT OUTER JOIN user AS operator_obj ON operator_obj.id=log.operator LEFT OUTER JOIN photo AS targetP_obj ON log.target_type="Photo" AND targetP_obj.id=log.target LEFT OUTER JOIN user AS targetU_obj ON log.target_type="User" AND targetU_obj.id=log.target WHERE operator_obj.type <= ? AND (POSITION(? IN log.id) OR POSITION(? IN COALESCE(targetP_obj.name, targetU_obj.name)) OR POSITION(? IN target) OR POSITION(? IN operator_obj.name) OR POSITION(? IN operator) OR POSITION(? IN action))',

    //SpPreview
    addSpPreview: 'INSERT INTO sppreview values(?, ?)',
    getSpPreview: 'SELECT * FROM sppreview WHERE user=? AND photo=?',
};