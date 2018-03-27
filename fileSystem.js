const fs = require('fs');
const fsextra = require('fs-extra');
const dvpl = require('./dvpl_convert.js');

async function recursionOnFolders (passFun, dir, outDir){
    let fileCount = 0;
    let dirList = await fsextra.readdir(dir);
    dirList.map(async x => {
        if(fs.statSync(`${dir}\\${x}`).isDirectory()){
            fsextra.mkdirs(`${outDir}\\${x}`);
            fileCount += await recursionOnFolders(passFun,`${dir}\\${x}`,`${outDir}\\${x}`);
        }
        else {
            passFun(`${dir}\\${x}`,`${outDir}\\${x}`);
            fileCount += 1;
        }
    });
    return fileCount
}

async function compress (fileIn, fileOut){
    let fileData = await fsextra.readFile(fileIn);
    try{
        fsextra.writeFile(fileOut + '.dvpl', dvpl.compressDVPl(fileData));
        console.log(`File ${fileIn} has been successfully compressed into ${fileOut}.dvpl`)
    } catch (err){
        console.log("\x1b[41m%\x1b[0m", `File ${fileIn} Failed to convert due to ${err}`)
    }
}

async function decompress (fileIn, fileOut){
    let fileData = await fsextra.readFile(fileIn);
    try{
        fsextra.writeFile(fileOut.replace(".dvpl",""), dvpl.decompressDVPL(fileData));
        console.log(`File ${fileIn} has been successfully decompressed into ${fileOut.replace(".dvpl","")}`)
    }
    catch(err){
        console.log("\x1b[41m%\x1b[0m", `File ${fileIn} Failed to convert due to ${err}`)
    }
}

exports.recursionOnFolders = recursionOnFolders;
exports.compress = compress;
exports.decompress = decompress;