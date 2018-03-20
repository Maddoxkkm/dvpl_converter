const lz4 = require("lz4");
const fs = require("fs");

let input = fs.readFileSync('./Extracted/barrel_2_dust.yaml');
let output = lz4.encode(input,{highCompression: true});


fs.writeFileSync('test2.lz4', output);