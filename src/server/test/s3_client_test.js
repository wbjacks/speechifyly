var _aws    = require('aws-sdk'),
    _assert = require('chai').assert,
    _sinon  = require('sinon'),
    _stream = require('stream');

var s3Client = require('services/s3_client.js');

describe('S3 Client', function() {
    var s3 = new _aws.S3(),
        sandbox = _sinon.sandbox.create();

    beforeEach(function() {
        sandbox.stub(_aws, 'S3').returns(s3);
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('getBucketNames', function() {
        it('should call s3#listBuckets and if there are errors, propagate them', function(done) {
            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'listBuckets', function(callback) {
                callback(returnedS3Error, null);
            });

            s3Client.getBucketNames(function(err, bucketNames) {
                _assert.isUndefined(bucketNames);
                _assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#listBuckets and if there are no errors, parse and return the bucket names', function(done) {
            var response = { 
                Buckets : [{ Name : 'Name1' }, { Name : 'Name2' }] 
            };
            sandbox.stub(s3, 'listBuckets', function(callback) {
                callback(null, response);
            });

            var expectedBucketNames = ['Name1', 'Name2'];
            s3Client.getBucketNames(function(err, bucketNames) {
                _assert.isUndefined(err);
                _assert.deepEqual(expectedBucketNames, bucketNames);
                done();
            });
        });
    });

    describe('getKeysInBucket', function() {
        it('should call s3#listObjects and if there are errors, propagate them', function(done) {
            var bucketName = 'BUCKET NAME';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'listObjects', function(objectInfo, callback) {
                _assert.equal(bucketName, objectInfo.Bucket);
                _assert.isUndefined(objectInfo.Marker);
                callback(returnedS3Error);
            });

            s3Client.getKeysInBucket(bucketName, function(err, keys) {
                _assert.equal(returnedS3Error, err);
                _assert.isUndefined(keys);
                done();
            });
        });

        it('should call s3#listObjects until IsTruncated = false, returning aggregated key names', function(done) {
            var bucketName = 'BUCKET NAME';

            var firstResponse = {
                Contents : [{ Key : 'Key1' }, { Key : 'Key2' }],
                IsTruncated : true,
                NextMarker : 2
            };
            var secondResponse = {
                Contents : [{ Key : 'Key3' }],
                IsTruncated : false
            };
            sandbox.stub(s3, 'listObjects', function(objectInfo, callback) {
                _assert.equal(bucketName, objectInfo.Bucket);
                if (!objectInfo.Marker) {
                    callback(undefined, firstResponse);
                } else if (objectInfo.Marker == 2) {
                    callback(undefined, secondResponse);
                }
            });

            var expectedKeys = ['Key1', 'Key2', 'Key3'];
            s3Client.getKeysInBucket(bucketName, function(err, keys) {
                _assert.isUndefined(err);
                _assert.deepEqual(expectedKeys, keys);
                done();
            });
        });
    });

    describe('createBucket', function() {
        it('should call s3#createBucket and if there are errors, propagate them', function(done) {
            var newBucketName = 'BUCKET NAME';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'createBucket', function(objectInfo, callback) {
                _assert.equal(newBucketName, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.createBucket(newBucketName, function(err) {
                _assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#createBucket and if there are no errors, do nothing', function(done) {
            var newBucketName = 'BUCKET NAME';

            sandbox.stub(s3, 'createBucket', function(objectInfo, callback) {
                _assert.equal(newBucketName, objectInfo.Bucket);
                callback();
            });

            s3Client.createBucket(newBucketName, function(err) {
                _assert.isUndefined(err);
                done();
            });
        });
    });

    describe('putInBucket', function() {
        it('should call s3#upload and if there are errors, propagate them', function(done) {
            var key = 'NEW KEY',
                valueStream = new _stream.Readable('SOME STREAM'),
                targetBucket = 'TARGET BUCKET';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'upload', function(objectInfo, callback) {
                _assert.equal(key, objectInfo.Key);
                _assert.equal(valueStream, objectInfo.Body);
                _assert.equal(targetBucket, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.putInBucket(key, valueStream, targetBucket, function(err) {
                _assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#upload and if there are no errors, do nothing', function(done) {
            var key = 'NEW KEY',
                valueStream = new _stream.Readable('SOME STREAM'),
                targetBucket = 'TARGET BUCKET';

            sandbox.stub(s3, 'upload', function(objectInfo, callback) {
                _assert.equal(key, objectInfo.Key);
                _assert.equal(valueStream, objectInfo.Body);
                _assert.equal(targetBucket, objectInfo.Bucket);
                callback();
            });

            s3Client.putInBucket(key, valueStream, targetBucket, function(err) {
                _assert.isUndefined(err);
                done();
            });
        });
    });

    describe('removeFromBucket', function() {
        it('should call s3#deleteObject and if there are errors, propagate them', function(done) {
            var keyToDelete = 'KEY TO DELETE',
                containingBucket = 'CONTAINING BUCKET';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'deleteObject', function(objectInfo, callback) {
                _assert.equal(keyToDelete, objectInfo.Key);
                _assert.equal(containingBucket, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.removeFromBucket(keyToDelete, containingBucket, function(err) {
                _assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#deleteObject and if there are no errors, do nothing', function(done) {
            var keyToDelete = 'KEY TO DELETE',
                containingBucket = 'CONTAINING BUCKET';

            sandbox.stub(s3, 'deleteObject', function(objectInfo, callback) {
                _assert.equal(keyToDelete, objectInfo.Key);
                _assert.equal(containingBucket, objectInfo.Bucket);
                callback();
            });

            s3Client.removeFromBucket(keyToDelete, containingBucket, function(err) {
                _assert.isUndefined(err);
                done();
            });
        });
    });

    describe('deleteBucket', function() {
        it('should call s3#deleteBucket and if there are errors, propagate them', function(done) {
            var bucketToDelete = 'BUCKET TO DELETE';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'deleteBucket', function(objectInfo, callback) {
                _assert.equal(bucketToDelete, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.deleteBucket(bucketToDelete, function(err) {
                _assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#deleteBucket and if there are no errors, do nothing', function(done) {
            var bucketToDelete = 'BUCKET TO DELETE';

            sandbox.stub(s3, 'deleteBucket', function(objectInfo, callback) {
                _assert.equal(bucketToDelete, objectInfo.Bucket);
                callback();
            });

            s3Client.deleteBucket(bucketToDelete, function(err) {
                _assert.isUndefined(err);
                done();
            });
        });
    });
}); 
