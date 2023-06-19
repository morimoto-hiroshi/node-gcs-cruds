/**
 * Google Cloud Storage の Create/Read/Update/Delete/Select サンプル
 */

/**
 * keyFile.json(*1) の取得方法
 * GCPコンソールで プロジェクト(*2) を選択し、IAMと管理＞サービスアカウント へ。
 * サービスアカウント一覧の「App Engine default service account」から、
 * 操作＞鍵を管理＞鍵を追加＞新しい鍵を作成＞タイプ=JSON＞作成＞jsonがダウンロードされる
 */

const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
    keyFilename: './keys/keyFile.json', //keyFile(*1)
    projectId: 'project-name' //プロジェクト(*2)
});
const bucket = storage.bucket('bucket-name');

/**
 * 以下、CRUDSのラッパー、callbackとasync
 */

/**
 * アップロード
 * https://googleapis.dev/nodejs/storage/latest/Bucket.html#upload
 */
function uploadFile(localPath, remotePath, callback) {
    bucket.upload(localPath, {destination: remotePath}, (err, file) => callback(err, file));
}

async function uploadFileAsync(localPath, remotePath) {
    return await bucket.upload(localPath, {destination: remotePath}); //.then([file]) => {}
}

/**
 * ダウンロード
 * https://googleapis.dev/nodejs/storage/latest/File.html#download
 */
function downloadFile(remotePath, localPath, callback) {
    bucket.file(remotePath).download({destination: localPath}, (err) => callback(err));
}

async function downloadFileAsync(remotePath, localPath) {
    return await bucket.file(remotePath).download({destination: localPath}); //.then() => {}
}

/**
 * ファイル削除
 * https://googleapis.dev/nodejs/storage/latest/File.html#delete
 */
function deleteFile(remotePath, callback) {
    bucket.file(remotePath).delete({ignoreNotFound: true}, (err) => callback(err));
}

async function deleteFileAsync(remotePath) {
    return await bucket.file(remotePath).delete({ignoreNotFound: true}); //.then() => {}
}

/**
 * 存在検査
 * https://googleapis.dev/nodejs/storage/latest/File.html#exists
 */
function existsFile(remotePath, callback) {
    bucket.file(remotePath).exists({}, (err, exists) => callback(err, exists));
}

async function existsFileAsync(remotePath) {
    return await bucket.file(remotePath).exists({}); //.then([exists]) => {}
}

/**
 * ファイル一覧
 * https://googleapis.dev/nodejs/storage/latest/Bucket.html#getFiles
 */
function listFiles(callback) {
    bucket.getFiles({}, (err, files) => callback(err, files));
}

async function listFilesAsync() {
    return await bucket.getFiles({}); //.then([files]) => {}
}

/**
 * callback テスト
 */
function callbackTest(doneBlock) {
    console.log('--- callback test');
    uploadFile('./.data/hello.txt', 'hello1.txt', (err, file) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`uploadFile(${file.name}) done`);
        uploadFile('./.data/hello.txt', 'foo/hello2.txt', (err, file) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(`uploadFile(${file.name}) done`);
            downloadFile('hello1.txt', './.data/_hello1.txt', (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(`downloadFile('hello1.txt') done`);
                existsFile('foo/hello2.txt', (err, exists) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(`existsFile('foo/hello2.txt'): ${exists}`);
                    listFiles((err, files) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        files.forEach((file) => {
                            console.log(`listFiles: ${file.name}`);
                        });
                        deleteFile('foo/hello2.txt', (err) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log(`deleteFile('foo/hello2.txt') done`);
                            existsFile('foo/hello2.txt', (err, exists) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                console.log(`existsFile('foo/hello2.txt'): ${exists}`);
                                listFiles((err, files) => {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    files.forEach((file) => {
                                        console.log(`listFiles: ${file.name}`);
                                        doneBlock();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
 * async テスト
 */
function asyncTest() {
    Promise.resolve().then(() => {
        console.log('--- async test');
        return uploadFileAsync('./.data/hello.txt', 'hello1.txt');
    }).then(([file]) => {
        console.log(`uploadFileAsync(${file.name}) done`);
        return uploadFileAsync('./.data/hello.txt', 'foo/hello2.txt');
    }).then(([file]) => {
        console.log(`uploadFileAsync(${file.name}) done`);
        return downloadFileAsync('hello1.txt', './.data/_hello1.txt');
    }).then(() => {
        console.log(`downloadFileAsync('hello1.txt') done`);
        return existsFileAsync('foo/hello2.txt');
    }).then(([exists]) => {
        console.log(`existsFileAsync('foo/hello2.txt') ${exists}`);
        return listFilesAsync();
    }).then(([files]) => {
        files.forEach((file) => {
            console.log(`listFilesAsync: ${file.name}`);
        });
        return deleteFileAsync('foo/hello2.txt');
    }).then(() => {
        console.log(`deleteFileAsync('foo/hello2.txt') done`);
        return existsFileAsync('foo/hello2.txt');
    }).then(([exists]) => {
        console.log(`existsFileAsync('foo/hello2.txt'): ${exists}`);
        return listFilesAsync();
    }).then(([files]) => {
        files.forEach((file) => {
            console.log(`listFilesAsync: ${file.name}`);
        });
    });
}

callbackTest(() => {
    asyncTest();
});
