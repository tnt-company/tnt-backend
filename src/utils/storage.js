const AWS = require('aws-sdk');
const config = require('../config/config');

/**
 * Storage Provider Interface
 * Abstract class that defines the interface for storage providers
 */
class StorageProvider {
  /**
   * Upload a file to storage
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @param {string} fileName - The name to give the file in storage
   * @param {string} contentType - The MIME type of the file
   * @returns {Promise<string>} The path or key of the uploaded file
   */
  async uploadFile(_fileBuffer, _fileName, _contentType) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a file from storage
   * @param {string} fileKey - The key/path of the file to delete
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  async deleteFile(_fileKey) {
    throw new Error('Method not implemented');
  }

  /**
   * Get the full URL of a file
   * @param {string} fileKey - The key/path of the file
   * @returns {string} The full URL to access the file
   */
  getFileUrl(_fileKey) {
    throw new Error('Method not implemented');
  }
}

/**
 * AWS S3 Storage Provider
 * Implementation of StorageProvider for AWS S3
 */
class S3StorageProvider extends StorageProvider {
  constructor() {
    super();
    this.s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });
    this.bucketName = config.aws.bucketName;
  }

  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @param {string} fileName - The name to give the file in storage
   * @param {string} contentType - The MIME type of the file
   * @returns {Promise<string>} The S3 key of the uploaded file
   */
  async uploadFile(fileBuffer, fileName, contentType) {
    const key = `products/${Date.now()}-${fileName}`;

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    try {
      await this.s3.upload(params).promise();
      return key;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   * @param {string} fileKey - The S3 key of the file to delete
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  async deleteFile(fileKey) {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Get the full URL of a file in S3
   * @param {string} fileKey - The S3 key of the file
   * @returns {string} The full URL to access the file
   */
  getFileUrl(fileKey) {
    // We don't construct the full URL here as per requirements
    // The bucket name will be added by the frontend from env variables
    return fileKey;
  }
}

// Factory function to get the appropriate storage provider
const getStorageProvider = () => {
  // Currently only S3 is supported, but this could be extended in the future
  return new S3StorageProvider();
};

// Export a singleton instance
const storageProvider = getStorageProvider();

module.exports = {
  storageProvider,
  getStorageProvider,
  StorageProvider,
  S3StorageProvider,
};
