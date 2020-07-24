# Simple Digital Ocean Spaces Client

[![Build Status](https://travis-ci.org/KasselLabs/simple-do-spaces.svg?branch=master)](https://travis-ci.org/KasselLabs/simple-do-spaces) [![dependencies Status](https://david-dm.org/KasselLabs/simple-do-spaces/status.svg)](https://david-dm.org/KasselLabs/simple-do-spaces) [![devDependencies Status](https://david-dm.org/KasselLabs/simple-do-spaces/dev-status.svg)](https://david-dm.org/KasselLabs/simple-do-spaces?type=dev) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Usage

### Credentials setup

You can set the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_KEY` as default credentials for the S3 SDK which is also used by Digital Ocean Spaces API.

### Create client for Digital Ocean Spaces API

```js
import SpacesClient from 'simples-do-spaces';

const client = new SpacesClient(
  'sfo2.digitaloceanspaces.com', // Required, Digital Ocean Spaces Endpoint
  'bucketName', // Required. Bucket name
  'accessKeyId', // Optional. Access key, can be provided via env var AWS_ACCESS_KEY_ID
  'secretAccessKey' // Optional. Access key secret, can be env var AWS_SECRET_ACCESS_KEY
  'digitalOceanAPIToken' // Optional. Digital Ocean API Token, used to purge the cdn cache
  'cdnEndpointId' // Optional. CDN's Endpoint Id, used to purge the cdn cache,
                     // if not provided will be auto-extracted from bucketName.
);

```

All methods returns a Promise which resolves to the values described below.

### Upload file

```js
client.uploadFile(uploadFilePath, destinationPath, permission);
```

- **uploadFilePath** : File path in file system
- **destinationPath** : Path to save in DO Spaces
- **permission** : Permission of the file, default is `private`, can also be `public-read`.
- **options** : Options object to be sent to S3 SDK
  - **exponentialBackoff** : Use exponential backoff if the upload failed
  - **purgeCache** : Purge the cache from CDN related to this new file

#### Return file URL in DO Spaces CDN

### List files

```js
client.listPathFiles(path, options = {});
```

- **path** : Path in DO Spaces to list
- **options** : Options object
  - **sortByDate** : Sort files by LastModified date, can be 'ASC' (default) or 'DESC'
  - **pathOnly** : If true it will not return the complete URL just the path in DO Spaces

#### Return array of objects with the 'url' and 'lastModified' properties
```js
[ { url: 'file url', lastModified: Date }, ... ]
```

### Delete one file

```js
client.deleteFile(path);
```

- **path** : Relative path to one file in DO spaces to delete it

### Delete multiple files

```js
client.deletePaths(paths);
```

- **paths** : Array of relative paths in DO spaces to delete

### Copy file within DO Spaces

```js
client.copyFile(sourcePath, destinationPath);
```

### Download file

```js
client.downloadFile(filePathToRead, filePathToSave, createDirIfNotExists);
```

- **filePathToRead** : Path in DO Spaces
- **filePathToSave** : Path to save in file system
- **createDirIfNotExists** : Boolean to create the folder if the it doesn't exists. Default is `true`

## License

MIT © Bruno Orlandi
