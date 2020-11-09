#!/usr/bin/env node

// Load everything in
const fs = require('fs').promises
const dvpl = require('./dvpl_convert.js');
const path = require('path');

// scrappy cli code
const realArgs = process.argv.slice(2);
if (realArgs.length === 0) {
    throw 'No Mode selected. try dvpl help for advices.'
}

const optionalArgs = realArgs.slice(1);

let keeporingals = false;

optionalArgs.forEach(arg => {
    if (arg.toLowerCase() === '--keep-originals' || arg.toLowerCase() === '-ko' || arg.toLowerCase() === '--keep-original') keeporingals = true;
})

switch (realArgs[0].toLowerCase()) {
    case 'compress':
    case 'comp':
    case 'c':
        // compress
        dvplRecursion(process.cwd(), keeporingals, true).then(number => {
            console.log(`COMPRESSION FINISHED. COMPRESSED ${number} files.`)
        })
        break;
    case 'decompress':
    case 'decomp':
    case 'deco':
    case 'd':
        dvplRecursion(process.cwd(), keeporingals, false).then(number => {
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

// main code that does all the heavy lifting
async function dvplRecursion(originalsDir, keepOrignals = false, compression = false) {
    const dirList = await fs.readdir(originalsDir + "/", { withFileTypes: true });
    return await (dirList.map(async (dirItem) => {
            const isDecompression = !compression && dirItem.isFile() && dirItem.name.endsWith('.dvpl')
            const isCompression = compression && dirItem.isFile() && !dirItem.name.endsWith('.dvpl')
            if (dirItem.isDirectory()) {
                return await dvplRecursion(originalsDir + "/" + dirItem.name, keepOrignals, compression)
            }
            else if (isDecompression || isCompression) {
                try {
                    const fileData = await fs.readFile(originalsDir + "/" + dirItem.name)
                    const processedBlock = isCompression ? dvpl.compressDVPl(fileData) : dvpl.decompressDVPL(fileData);
                    const newName = path.basename(dirItem.name, '.dvpl')
                    await fs.writeFile(originalsDir + "/" + (isCompression ? dirItem.name + ".dvpl" : newName), processedBlock)
                    console.log(`File ${originalsDir + "/" + dirItem.name} has been successfully ${isCompression ? "compressed" : "decompressed"} into ${originalsDir + "/" + isCompression ? newName : dirItem.name + ".dvpl"}`)
                    keepOrignals ? undefined : await fs.unlink(originalsDir + "/" + dirItem.name);
                    return 1
                } catch (err) {
                    console.log(`File ${originalsDir + "/" + dirItem.name} Failed to convert due to ${err}`)
                    return 0
                }
            } else {
                return 0
            }
        })).reduce(async (a, b) => await a + await b, Promise.resolve(0))
}