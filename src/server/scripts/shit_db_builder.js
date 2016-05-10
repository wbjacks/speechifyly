var _shitDb = require('services/shitdb'),
    _fs = require('fs'),
    _s3Client = require('services/s3_client');

/*
options = {};
process.argv.forEach(function(arg) {
    var activeOption;
    if (arg === '-') {
        if (activeOption) {
            options[activeOption] = true;
        }
        activeOption = arg.substring(1);
    }
    else if (activeOption) {
        options[activeOption] = arg;
    } 
    else {
        console.warn('Bad argument: ' + arg);
    }
});
*/

var obj;
try {
    obj = JSON.parse(_fs.readFileSync('./SHIT_DB'));
}
catch(e) {
    obj = {test: {}};
}

//_s3Client.putInBucket('test-');

obj.test[process.argv[2]] = _fs.readFileSync(process.argv[3]).toString();
_fs.writeFileSync('./SHIT_DB', JSON.stringify(obj));
