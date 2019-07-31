export default {
    addUser: 'INSERT INTO user(name, type, passcode, passrd) VALUES(?,?,?,?)',
    queryUserWithLimit: 'SELECT SQL_CALC_FOUND_ROWS * FROM user WHERE type <= ? LIMIT ?,?',
    getUserById: 'SELECT * FROM user WHERE id=?',
    searchUserWithLimited: 'SELECT SQL_CALC_FOUND_ROWS * FROM user WHERE (type <= ? and (POSITION(? IN name) OR POSITION(? IN id))) LIMIT ?,?',
    resetPassword: 'UPDATE user SET passcode=?, passrd=? WHERE id=?',
    deleteUser: 'DELETE FROM user WHERE id=?',
    resetUserType: 'UPDATE user SET type=? WHERE id=?',
    resetUserName: 'UPDATE user SET name=? WHERE id=?',
    total: 'SELECT FOUND_ROWS()',
    addPhoto: 'INSERT INTO photo(uploader_id, type, date) VALUES(?, 0, now())',
    updatePhoto: 'UPDATE photo SET type=1 WHERE id=?',
    publishPhoto: 'UPDATE photo SET type=2, name=? WHERE id=?',
};