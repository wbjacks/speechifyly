var S3Client = function() {
    var _aws = require('aws-sdk');

    // TODO: (wbjacks) creds are current invalid (sry hackers!!), add new creds to Heroku
    // environment
    _aws.config.accessKeyId = 'AKIAI7S5MMHPZCPO4Y6A';
    _aws.config.secretAccessKey = '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';
    _aws.config.region = 'us-west-2';

    return {
        getBucketNames: function(callback) {
            var s3 = new _aws.S3();
            s3.listBuckets(function(err, data) {
                if (err) { 
                    callback(err); 
                    return;
                }

                var bucketNames = data.Buckets.map(
                    function(bucket) { 
                        return bucket.Name; 
                    }
                );

                callback(undefined, bucketNames);
            });
        },

        getKeysInBucket: function(bucket, callback) {
            var keys = [];
            function getKeysInBucketRecursively(bucket, marker) {
                var s3 = new _aws.S3();
                s3.listObjects({Bucket: bucket, Marker: marker}, function(err, data) {
                    if (err) { 
                        callback(err); 
                        return;
                    }

                    data.Contents.forEach(function(item) {
                        keys.push(item.Key);
                    });

                    if (data.IsTruncated) {
                        getKeysInBucketRecursively(bucket, data.NextMarker);
                    } else {
                        callback(undefined, keys);
                    }
                });
            };

            getKeysInBucketRecursively(bucket);
        },

        createBucket: function(bucket, callback) {
            var s3 = new _aws.S3();
            s3.createBucket({Bucket: bucket}, function(err) {
                err ? callback(err) : callback();
            });
        },

        getFromBucket: function(key, bucket, callback) {
            var s3 = new _aws.S3();
            s3.getObject({Bucket: bucket, Key: key}, function(err, data) {
                err ? callback(err) : callback(undefined, data);
            });
        },

        getStreamFromBucket: function(key, bucket) {
            var s3 = new _aws.S3();
            return s3.getObject({Bucket: bucket, Key: key}).createReadStream();
        },

        putInBucket: function(key, valueStream, bucket, callback) {
            var s3 = new _aws.S3();
            s3.upload({Key: key, Body: valueStream, Bucket: bucket}, function(err, data) {
                err ? callback(err) : callback(undefined, data);
            });
        },

        removeFromBucket: function(key, bucket, callback) {
            var s3 = new _aws.S3();
            s3.deleteObject({Key: key, Bucket: bucket}, function(err) {
                err ? callback(err) : callback();
            });
        },

        deleteBucket: function(bucket, callback) {
            var s3 = new _aws.S3();
            s3.deleteBucket({Bucket: bucket}, function(err) {
                err ? callback(err) : callback();
            });
        }
    };
}

module.exports = S3Client();
