#!/usr/bin/env node

// Load everything in
const fs = require('fs');
const fsPromise = require('fs').promises;
const dvpl = require('./dvpl_convert.js');
const path = require('path');


const realArgs = process.argv.slice(2);
if (realArgs.length === 0) {
    throw 'No Mode selected. try dvpl help for advices.'
}

const optionalArgs = realArgs.slice(1);

let keeporingals = false;

optionalArgs.forEach(arg => {
    if (arg.toLowerCase() === '--keep-originals' || arg.toLowerCase() === '--ko' || arg.toLowerCase() === '--keep-original') keeporingals = true;
})

switch (realArgs[0].toLowerCase()) {
    case 'compress':
    case 'comp':
    case 'c':
        // compress
        compressionRecursion(process.cwd(), keeporingals).then(number => {
            console.log(`COMPRESSION FINISHED. COMPRESSED ${number} files.`)
        })
        break;
    case 'decompress':
    case 'decomp':
    case 'deco':
    case 'd':
        decompressRecursion(process.cwd(), keeporingals).then(number => {
            console.log(`DECOMPRESSION FINISHED. DECOMPRESSED ${number} files.`)
        })
        // decompress
        break;
    case 'help':
        console.log(`dvpl [mode] [--keep-originals]
            mode can be the following:
                compress: compresses files into dvpl
                decompress: decompresses dvpl files into standard files
                help: show this help message
            --keep-originals flag keeps the original files after compression/ decompression
        `)
        break;
    default:
        throw "incorrect mode selected. Use Help for information"
}

async function compressionRecursion(originalsDir, keepOrignals = false) {
    let fileCount = 0;
    const dirList = fs.readdirSync(originalsDir + "/", { withFileTypes: true });
    dirList.forEach(async dirItem => {
        if (dirItem.isDirectory()) {
            fileCount += await compressionRecursion(originalsDir + "/" + dirItem.name, keepOrignals)
        } else if (dirItem.isFile() && !dirItem.name.endsWith('.dvpl')) {
            try {
                fileCount += 1
                const fileData = fs.readFileSync(originalsDir + "/" + dirItem.name)
                const compressedBlock = dvpl.compressDVPl(fileData);
                fs.writeFileSync(originalsDir + "/" + dirItem.name + '.dvpl', compressedBlock)
                console.log(`File ${originalsDir + "/" + dirItem.name} has been successfully compressed into ${originalsDir + "/" + dirItem.name}.dvpl`)
                keepOrignals ? undefined : await fsPromise.unlink(originalsDir + "/" + dirItem.name);
            } catch (err) {
                console.log("\x1b[41m%\x1b[0m", `File ${originalsDir + "/" + dirItem.name} Failed to convert due to ${err}`)
            }
        }
    })
    return fileCount;
}


async function decompressRecursion(originalsDir, keepOrignals = false) {
    let fileCount = 0;
    const dirList = fs.readdirSync(originalsDir + "/", { withFileTypes: true });
    dirList.forEach(async dirItem => {
        if (dirItem.isDirectory()) {
            fileCount += await decompressRecursion(originalsDir + "/" + dirItem.name, keepOrignals)
        } else if (dirItem.isFile() && dirItem.name.endsWith('.dvpl')) {
            try {
                fileCount += 1
                const fileData = fs.readFileSync(originalsDir + "/" + dirItem.name)
                const newName = path.basename(dirItem.name, '.dvpl')
                const decompressedBlock = dvpl.decompressDVPL(fileData);
                fs.writeFileSync(originalsDir + "/" + newName, decompressedBlock)
                console.log(`File ${originalsDir + "/" + dirItem.name} has been successfully decompressed into ${originalsDir + "/" + newName}`)
                keepOrignals ? undefined : await fsPromise.unlink(originalsDir + "/" + dirItem.name);
            } catch (err) {
                console.log("\x1b[41m%\x1b[0m", `File ${originalsDir + "/" + dirItem.name} Failed to convert due to ${err}`)
            }
        }
    })
    return fileCount;
}