import AWS from 'aws-sdk';
import fs from 'fs';
import nodePath from 'path';
import mime from 'mime-types';

class SpacesClient {
  constructor(endpoint, bucket, accessKeyId = null, secretAccessKey = null) {
    this.endpoint = endpoint;
    this.bucket = bucket;

    const options = {
      endpoint,
    };

    if (accessKeyId) {
      options.accessKeyId = accessKeyId;
    }
    if (secretAccessKey) {
      options.secretAccessKey = secretAccessKey;
    }

    this.s3client = new AWS.S3(options);
  }

  getURL(path) {
    return `https://${this.bucket}.${this.endpoint}/${path}`;
  }

  getCDNURL(path) {
    const url = this.getURL(path);
    return url.replace(/digitaloceanspaces/, 'cdn.digitaloceanspaces');
  }

  async uploadFile(
    uploadFilePath,
    destinationPath,
    permission = 'private',
  ) {
    await this.s3client.upload({
      Bucket: this.bucket,
      Body: fs.createReadStream(uploadFilePath),
      Key: destinationPath,
      ACL: permission === 'public' ? 'public-read' : permission,
      // ContentDisposition: 'attachment',
      ContentType: mime.lookup(uploadFilePath),
    }).promise();

    return this.getCDNURL(destinationPath);
  }

  async listPathObjects(path) {
    const data = await this.s3client.listObjectsV2({
      Bucket: this.bucket,
      Prefix: path,
    }).promise();

    return data.Contents;
  }

  async listPathFiles(path) {
    const objects = await this.listPathObjects(path);
    return objects.map(({ Key }) => this.getCDNURL(Key));
  }

  async deleteObjects(objects) {
    return this.s3client.deleteObjects({
      Bucket: this.bucket,
      Delete: {
        Objects: objects.map(object => ({
          Key: object.Key,
        })),
      },
    }).promise();
  }

  async deletePaths(paths) {
    const objects = paths.map(path => ({
      Key: path,
    }));
    return this.deleteObjects(objects);
  }

  async deleteFile(path) {
    return this.deleteObjects([{
      Key: path,
    }]);
  }

  async deleteFolder(folderPath) {
    const objects = await this.listPathObjects(folderPath);
    return this.deleteObjects(objects);
  }

  async downloadFile(
    filePathToRead,
    filePathToSave,
    createDirIfNotExists = true
  ) {
    if (createDirIfNotExists) {
      const parentPath = nodePath.dirname(filePathToSave);
      await fs.promises.mkdir(parentPath, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const fileWriteStream = fs.createWriteStream(filePathToSave);

      this.s3client.getObject({
        Bucket: this.bucket,
        Key: filePathToRead,
      })
        .on('error', (error) => {
          fs.unlinkSync(filePathToSave);
          reject(error);
        })
        .createReadStream()
        .pipe(fileWriteStream);


      fileWriteStream.on('finish', () => {
        resolve(filePathToSave);
      });
    });
  }
}

export default SpacesClient;
