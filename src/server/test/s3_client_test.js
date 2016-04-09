var aws    = require('aws-sdk');
var assert = require('chai').assert;
var sinon  = require('sinon');
var stream = require('stream');

var s3Client = require('services/s3_client.js');

describe('S3 Client', function() {
    var sandbox = sinon.sandbox.create();
    var s3 = new aws.S3();

    beforeEach(function() {
        sandbox.stub(aws, 'S3').returns(s3);
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
                assert.isUndefined(bucketNames);
                assert.equal(returnedS3Error, err);
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
                assert.isUndefined(err);
                assert.deepEqual(expectedBucketNames, bucketNames);
                done();
            });
        });
    });

    describe('getKeysInBucket', function() {
        it('should call s3#listObjects and if there are errors, propagate them', function(done) {
            var bucketName = 'BUCKET NAME';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'listObjects', function(objectInfo, callback) {
                assert.equal(bucketName, objectInfo.Bucket);
                assert.isUndefined(objectInfo.Marker);
                callback(returnedS3Error);
            });

            s3Client.getKeysInBucket(bucketName, function(err, keys) {
                assert.equal(returnedS3Error, err);
                assert.isUndefined(keys);
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
                assert.equal(bucketName, objectInfo.Bucket);
                if (!objectInfo.Marker) {
                    callback(undefined, firstResponse);
                } else if (objectInfo.Marker == 2) {
                    callback(undefined, secondResponse);
                }
            });

            var expectedKeys = ['Key1', 'Key2', 'Key3'];
            s3Client.getKeysInBucket(bucketName, function(err, keys) {
                assert.isUndefined(err);
                assert.deepEqual(expectedKeys, keys);
                done();
            });
        });
    });

    describe('createBucket', function() {
        it('should call s3#createBucket and if there are errors, propagate them', function(done) {
            var newBucketName = 'BUCKET NAME';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'createBucket', function(objectInfo, callback) {
                assert.equal(newBucketName, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.createBucket(newBucketName, function(err) {
                assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#createBucket and if there are no errors, do nothing', function(done) {
            var newBucketName = 'BUCKET NAME';

            sandbox.stub(s3, 'createBucket', function(objectInfo, callback) {
                assert.equal(newBucketName, objectInfo.Bucket);
                callback();
            });

            s3Client.createBucket(newBucketName, function(err) {
                assert.isUndefined(err);
                done();
            });
        });
    });

    describe('putInBucket', function() {
        it('should call s3#upload and if there are errors, propagate them', function(done) {
            var key = 'NEW KEY';
            var valueStream = new stream.Readable('SOME STREAM');
            var targetBucket = 'TARGET BUCKET';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'upload', function(objectInfo, callback) {
                assert.equal(key, objectInfo.Key);
                assert.equal(valueStream, objectInfo.Body);
                assert.equal(targetBucket, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.putInBucket(key, valueStream, targetBucket, function(err) {
                assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#upload and if there are no errors, do nothing', function(done) {
            var key = 'NEW KEY';
            var valueStream = new stream.Readable('SOME STREAM');
            var targetBucket = 'TARGET BUCKET';

            sandbox.stub(s3, 'upload', function(objectInfo, callback) {
                assert.equal(key, objectInfo.Key);
                assert.equal(valueStream, objectInfo.Body);
                assert.equal(targetBucket, objectInfo.Bucket);
                callback();
            });

            s3Client.putInBucket(key, valueStream, targetBucket, function(err) {
                assert.isUndefined(err);
                done();
            });
        });
    });

    describe('removeFromBucket', function() {
        it('should call s3#deleteObject and if there are errors, propagate them', function(done) {
            var keyToDelete = 'KEY TO DELETE';
            var containingBucket = 'CONTAINING BUCKET';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'deleteObject', function(objectInfo, callback) {
                assert.equal(keyToDelete, objectInfo.Key);
                assert.equal(containingBucket, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.removeFromBucket(keyToDelete, containingBucket, function(err) {
                assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#deleteObject and if there are no errors, do nothing', function(done) {
            var keyToDelete = 'KEY TO DELETE';
            var containingBucket = 'CONTAINING BUCKET';

            sandbox.stub(s3, 'deleteObject', function(objectInfo, callback) {
                assert.equal(keyToDelete, objectInfo.Key);
                assert.equal(containingBucket, objectInfo.Bucket);
                callback();
            });

            s3Client.removeFromBucket(keyToDelete, containingBucket, function(err) {
                assert.isUndefined(err);
                done();
            });
        });
    });

    describe('deleteBucket', function() {
        it('should call s3#deleteBucket and if there are errors, propagate them', function(done) {
            var bucketToDelete = 'BUCKET TO DELETE';

            var returnedS3Error = 'SOME ERROR';
            sandbox.stub(s3, 'deleteBucket', function(objectInfo, callback) {
                assert.equal(bucketToDelete, objectInfo.Bucket);
                callback(returnedS3Error);
            });

            s3Client.deleteBucket(bucketToDelete, function(err) {
                assert.equal(returnedS3Error, err);
                done();
            });
        });

        it('should call s3#deleteBucket and if there are no errors, do nothing', function(done) {
            var bucketToDelete = 'BUCKET TO DELETE';

            sandbox.stub(s3, 'deleteBucket', function(objectInfo, callback) {
                assert.equal(bucketToDelete, objectInfo.Bucket);
                callback();
            });

            s3Client.deleteBucket(bucketToDelete, function(err) {
                assert.isUndefined(err);
                done();
            });
        });
    });
}); 