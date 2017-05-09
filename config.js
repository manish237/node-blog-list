/**
 * Created by mjaiswal on 5/7/2017.
 */
exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/thinkfulblogs';
exports.TEST_DATABASE_URL = (
process.env.TEST_DATABASE_URL ||
'mongodb://localhost/test-thinkfulblogs');
exports.PORT = process.env.PORT || 8080;