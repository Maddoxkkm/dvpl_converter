const lz4 = require("lz4");
const fs = require("fs");
const crc32 = require("buffer-crc32");

/**
 * @param inputFile File Path of the Uncompressed File.
 * @param outputfile File Path of where the Compressed dvpl file should be written to (might be omitted in future)
 */
function compressDVPL(inputFile,outputfile){
    let input = fs.readFileSync(inputFile);
    let output = Buffer.alloc(lz4.encodeBound(input.length));

    let compressedBlockSize = lz4.encodeBlockHC(input,output);

    let output2 = output.slice(0, compressedBlockSize);

    let footerBuffer = footer(input.length,compressedBlockSize,crc32(output.slice(0, compressedBlockSize)),2);
    let result = Buffer.concat([output2,footerBuffer], compressedBlockSize + 20);

    fs.writeFileSync(`${outputfile}.dvpl`, result);
}

function decompressDVPL(){
    //Awaiting Implmentation
}

/**
 * @param inputSize of the original file block
 * @param compressedSize of the compressed file block
 * @param crc32 of the compressed block (in buffer?)
 * @param type (0: not compressed, 1: not sure but probably standard LZ4, 2: LZ4_HC)
 * @return Buffer that consists of 20 bytes, with the footer data all ready to be written.
 */
function footer(inputSize, compressedSize, crc32, type){
    let result = Buffer.alloc(20);
    result.writeInt32LE(inputSize, 0);
    result.writeInt32LE(compressedSize, 4);
    result.writeInt32LE(type, 12);
    result.writeInt32LE(crc32.readInt32BE(0),8);
    result.write("DVPL", 16, 4, 'utf8');
    return result;
}

// below is test code
compressDVPL('./Extracted/barrel_2_dust.yaml', './barrel_2_dust.yaml');


// export compress as module.
module.exports = compressDVPL;