export default {
    insert: 'INSERT INTO user(name, type, passcode, passrd) VALUES(?,?,?,?)',
    drop: 'DROP TABLE user',
    queryAllLimited: 'SELECT SQL_CALC_FOUND_ROWS * FROM user WHERE type <= ? LIMIT ?,?',
    getUserById: 'SELECT * FROM user WHERE id=?',
    searchUserLimited: 'SELECT SQL_CALC_FOUND_ROWS * FROM user WHERE (type <= ? and (POSITION(? IN name) OR POSITION(? IN id))) LIMIT ?,?',
    resetPassword: 'UPDATE user SET passcode=?, passrd=? WHERE id=?',
    deleteUser: 'DELETE FROM user WHERE id=?',
    resetType: 'UPDATE user SET type=? WHERE id=?',
    resetName: 'UPDATE user SET name=? WHERE id=?',
    total: 'SELECT FOUND_ROWS()'
};