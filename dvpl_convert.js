const lz4 = require("lz4");
const fs = require("fs");

function compress(){
    let input = fs.readFileSync('./Extracted/barrel_2_dust.yaml');
    let output = Buffer.alloc( lz4.encodeBound(input.length) );
    let inputSize = lz4.encodeBound(input.length);

    let compressedBlockSize = lz4.encodeBlockHC(input,output);

    console.log(`${inputSize}, ${compressedBlockSize}`);

    let output2 = output.slice(0, compressedBlockSize);

    fs.writeFileSync('test2.lz4', output2);
}


compress();