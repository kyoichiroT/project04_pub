// const serverConfig = {
//   host: 'http://localhost:',
//   port: 2000,
// };

// const clientConfig = {
//   host: 'http://localhost:',
//   port: 3000,
// };

// serverConfig.path = serverConfig.host + serverConfig.port;
// clientConfig.path = clientConfig.host + clientConfig.port;

// module.exports = {
//   serverConfig,
//   clientConfig
// };


const { S3Client } = require("@aws-sdk/client-s3");

const bucketName = "04kankyoudata";
const s3Client = new S3Client({
  region: "ap-northeast-1", // 例: 'us-east-1'. バケットが存在するリージョンに応じて変更してください
  // 必要に応じて認証情報を設定
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
module.exports = { s3Client, bucketName };