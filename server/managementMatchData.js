const { s3Client, bucketName } = require('./config/config');
const { ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const path = require('path');
const lockfile = require('lockfile');



class MatchDataManager {
    constructor(filePrefix) {
        this.filePrefix = filePrefix;
        this.fileNumber = null;
        this.dataCount = 0;
        this.filePath = null;
        this.initialized = false; // 初期化が完了したかどうかを追跡するフラグ
    }


    async initialize() {
        if (!this.initialized) {
            if (this.fileNumber === null) {
                const command = new ListObjectsV2Command({
                    Bucket: bucketName,
                    Prefix: `${this.filePrefix}_`
                });
                const { Contents } = await s3Client.send(command);
                const fileNumbers = (Contents || []).map(file => {
                    const match = file.Key.match(new RegExp(`${this.filePrefix}_(\\d+)\\.csv$`));
                    return match ? parseInt(match[1], 10) : 0;
                });
                this.fileNumber = Math.max(...fileNumbers, 0) + 1;
                this.initialized = true; // 初期化が完了したことを示す
                this.updateFilePath();
                await this.checkOrCreateFile();
            }
        }
    }

    updateFilePath() {
        console.log(path.join(__dirname, 'csv', `${this.filePrefix}_${this.fileNumber}.csv`))
        this.filePath = path.join(__dirname, 'csv', `${this.filePrefix}_${this.fileNumber}.csv`);
    }

    async addData(data) {
        await this.initialize();

        function getFileLineCount(filePath) {
            return new Promise((resolve, reject) => {
                let lineCount = 0;
                fs.createReadStream(filePath)
                    .on('data', buffer => {
                        let idx = -1;
                        lineCount--; // 最後の行の改行を考慮してデクリメント
                        do {
                            idx = buffer.indexOf(10, idx + 1);
                            lineCount++;
                        } while (idx !== -1);
                    })
                    .on('end', () => {
                        resolve(lineCount);
                    })
                    .on('error', reject);
            });
        }

        function writeCSVWithLock(filePath, obj, maxLines = 100) {
            console.log(obj)
            return getFileLineCount(filePath)
                .then(lineCount => {
                    let headers = '';
                    if (lineCount === 0) { // 最初の行の場合、ヘッダを含める
                        headers = Object.keys(obj).join(',') + '\n';
                    }
                    // CSV形式に変換
                    const values = Object.values(obj).map(value =>
                        Array.isArray(value) ? `"${value.join('|')}"` : value // 配列をパイプ区切りの文字列に変換
                    ).join(',');
                    const csvData = headers + values;

                    // ファイルロックを取得して書き込み
                    const lockPath = `${filePath}.lock`;
                    return new Promise((resolve, reject) => {
                        lockfile.lock(lockPath, { retries: 10, retryWait: 100 }, (lockErr) => {
                            if (lockErr) return reject(lockErr);

                            fs.appendFile(filePath, csvData + '\n', (writeErr) => {
                                lockfile.unlock(lockPath, (unlockErr) => {
                                    if (unlockErr) return reject(unlockErr);
                                    if (writeErr) return reject(writeErr);
                                    resolve();
                                });
                            });
                        });
                    });
                });
        }
        const maxLines = 10; // ここで最大行数を設定
        try {
            await writeCSVWithLock(this.filePath, data, maxLines)
            console.log('CSVファイルに書き込みました。')

            // データをファイルに追加する処理...
            this.dataCount += 1;
            if (this.dataCount >= maxLines) {
                await this.uploadFile();
                this.fileNumber += 1;
                this.dataCount = 0;
                this.updateFilePath();
                await this.checkOrCreateFile();
            }
        } catch (error) {
            console.error('書き込みエラー:', error)
        };

    }
    async checkOrCreateFile() {
        this.filePath = path.join(__dirname, 'csv', `${this.filePrefix}_${this.fileNumber}.csv`);
        try {
            await fs.promises.access(this.filePath, fs.constants.F_OK);
        } catch (error) {
            // ファイルが存在しない場合、新しいファイルを作成
            await fs.promises.writeFile(this.filePath, '', 'utf8');
        }
    }

    async uploadFile() {
        const fileContent = await fs.promises.readFile(this.filePath);
        console.log('upload file content', this.filePath)
        console.log(fileContent)
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: path.basename(this.filePath),
            Body: fileContent
        });
        await s3Client.send(command);
        console.log(`${this.filePath} has been uploaded to S3.`);
    }
}

module.exports = MatchDataManager;