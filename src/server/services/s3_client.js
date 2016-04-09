var aws = require('aws-sdk');

// eventually need to move this stuff somewhere else (Vault?) but whatever 4 now
aws.config.accessKeyId = '';
aws.config.secretAccessKey = '';
aws.config.region = 'us-west-2';

function getBucketNames(callback) {
	var s3 = new aws.S3();
	s3.listBuckets(function(err, data) {
		if (err) { 
			callback(err); 
			return;
		}

		var bucketNames = data.Buckets.map(
			function(bucket) { return bucket.Name; });

		callback(undefined, bucketNames);
	});
}

function getKeysInBucket(bucket, callback) {
	var keys = [];

	getKeysInBucketRecursively(bucket);

  	function getKeysInBucketRecursively(bucket, marker) {
  		var s3 = new aws.S3();
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
  	}
}

function createBucket(bucket, callback) {
	var s3 = new aws.S3();
	s3.createBucket({Bucket: bucket}, function(err) {
		if (err) {
			callback(err);
			return;
		}
		callback();
	});
}

function putInBucket(key, valueStream, bucket, callback) {
	var s3 = new aws.S3();
	s3.upload({Key: key, Body: valueStream, Bucket: bucket}, function(err, data) {
		if (err) {
			callback(err);
			return;
		}
		callback(undefined, data);
	});
}

function removeFromBucket(key, bucket, callback) {
	var s3 = new aws.S3();
	s3.deleteObject({Key: key, Bucket: bucket}, function(err) {
		if (err) {
			callback(err);
			return;
		}
		callback();
	});
}

function deleteBucket(bucket, callback) {
	var s3 = new aws.S3();
	s3.deleteBucket({Bucket: bucket}, function(err) {
		if (err) {
			callback(err);
			return;
		}
		callback();
	});
}

module.exports = {
	getBucketNames: getBucketNames,
	getKeysInBucket: getKeysInBucket,
	createBucket: createBucket,
	putInBucket: putInBucket,
	removeFromBucket: removeFromBucket,
	deleteBucket: deleteBucket
}