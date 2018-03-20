const lz4 = require("lz4");
const fs = require("fs-extra");

var input = fs.readFileSync('./barrel_2_dust.yaml');
var output = lz4.encode(input,{highCompression: true});

fs.writeFileSync('test.lz4', output);


// there are a few things that need to be addressed:
// 1. there are some unidentified headers and tail data in both lz4 file and dvpl file. will need to figure a bit more about them
// 2. set this as a usual script so it can be used to pack and unpack large directories.
// 3. integrate it with zip-dir and stuff so it can also perform on zipped files.