var S3Client = function() {
	var _aws = require('aws-sdk');

	// eventually need to move this stuff somewhere else (Vault?) but whatever 4 now
	_aws.config.accessKeyId = '';
	_aws.config.secretAccessKey = '';
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
					function(bucket) { return bucket.Name; });

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
				if (err) {
					callback(err);
					return;
				}
				callback();
			});
		},

		putInBucket: function(key, valueStream, bucket, callback) {
			var s3 = new _aws.S3();
			s3.upload({Key: key, Body: valueStream, Bucket: bucket}, function(err, data) {
				if (err) {
					callback(err);
					return;
				}
				callback(undefined, data);
			});
		},

		removeFromBucket: function(key, bucket, callback) {
			var s3 = new _aws.S3();
			s3.deleteObject({Key: key, Bucket: bucket}, function(err) {
				if (err) {
					callback(err);
					return;
				}
				callback();
			});
		},

		deleteBucket: function(bucket, callback) {
			var s3 = new _aws.S3();
			s3.deleteBucket({Bucket: bucket}, function(err) {
				if (err) {
					callback(err);
					return;
				}
				callback();
			});
		}
	};
}

module.exports = S3Client;