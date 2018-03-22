const lz4 = require("lz4");
const fs = require("fs");
const crc32 = require("crc");

/**
 * @param {Buffer} buffer Buffer of the Uncompressed file
 * @return {Buffer} of the processed DVPL file
 */
function compressDVPL(buffer) {
    let output = Buffer.alloc(buffer.length);
    let compressedBlockSize = lz4.encodeBlockHC(buffer, output);

    let footerBuffer;
    if (compressedBlockSize === 0 || compressedBlockSize >= buffer.length) {
        //cannot be compressed or it became bigger after compressed (why compress it then?)
        footerBuffer = DVPLFooter(buffer.length, buffer.length, crc32.crc32(buffer), 0);
        return Buffer.concat([buffer, footerBuffer], buffer.length + 20);
    } else {
        output = output.slice(0, compressedBlockSize);
        footerBuffer = DVPLFooter(buffer.length, compressedBlockSize, crc32.crc32(output), 2);
        return Buffer.concat([output, footerBuffer], compressedBlockSize + 20);
    }
}

/**
 * @param {Buffer} buffer Buffer of a DVPL file
 * @return {Buffer} of the uncompressed file
 */
function decompressDVPL(buffer) {
    const footerData = readDVPLFooter(buffer);
    const targetBlock = buffer.slice(0, buffer.length - 20);

    if (targetBlock.length !== footerData.cSize) throw 'DVPLSizeMismatch';

    if (crc32.crc32(targetBlock) !== footerData.crc32) throw 'DVPLCRC32Mismatch';

    if (footerData.type === 0) {
        // The Above checks whether the block is compressed or not (by dvpl type recorded)
        // Below Check whether the Type recorded and Sizes are consistent. If the Type be 0 ,CompressedSize and OriginalSize must be equal.
        if (!(footerData.oSize === footerData.cSize && footerData.type === 0)) {
            throw 'DVPLTypeSizeMismatch';
        } else {
            return targetBlock;
        }
    }

    // Ready to Decompress
    let deDVPLBlock = Buffer.alloc(footerData.oSize);

    let DecompressedBlockSize = lz4.decodeBlock(targetBlock, deDVPLBlock);

    // If the decompressed size doesn't match original size stated in dvpl footer there is something wrong
    if (DecompressedBlockSize !== footerData.oSize) throw 'DVPLDecodeSizeMismatch';

    return deDVPLBlock;
}

/**
 * @param {int} inputSize of the original file block
 * @param {int} compressedSize of the compressed file block
 * @param {int} crc32 of the compressed block (in buffer?)
 * @param {int} type (0: not compressed, 1: not sure but probably standard LZ4, 2: LZ4_HC)
 * @return {Buffer} that consists of 20 bytes, with the footer data all ready to be appended on Compressed block.
 */
function DVPLFooter(inputSize, compressedSize, crc32, type) {
    let result = Buffer.alloc(20);
    result.writeInt32LE(inputSize, 0);
    result.writeInt32LE(compressedSize, 4);
    result.writeUInt32LE(crc32, 8);
    result.writeInt32LE(type, 12);
    result.write("DVPL", 16, 4, 'utf8');
    return result;
}

/**
 * @param {Buffer} buffer last 20 Bytes of data from dvpl files
 * @return {Object} that contains the 4 elements of dvpl file footer data (for validation)
 */
function readDVPLFooter(buffer) {
    let footerBuffer = buffer.slice(buffer.length - 20, buffer.length);
    //check for valid footer data
    if (footerBuffer.toString('utf8', 16, 20) !== 'DVPL' || footerBuffer.length !== 20) throw 'InvalidDVPLFooter';

    let footerObject = {};
    footerObject.oSize = footerBuffer.readInt32LE(0);
    footerObject.cSize = footerBuffer.readInt32LE(4);
    footerObject.crc32 = footerBuffer.readUInt32LE(8);
    footerObject.type = footerBuffer.readInt32LE(12);
    return footerObject;
}

// below is test code
/*
fs.writeFileSync('./test.dvpl', compressDVPL(fs.readFileSync('./Extracted/barrel_2_dust.yaml')));
fs.writeFileSync('./unCompressed.yaml', decompressDVPL(fs.readFileSync('./Extracted/barrel_2_dust.yaml.dvpl')));
*/

// export the following functions
module.exports = [compressDVPL, decompressDVPL, readDVPLFooter];