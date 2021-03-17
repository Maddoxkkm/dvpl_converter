#!/usr/bin/env node

// Load everything in
const fs = require('fs');
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
            console.log(`COMPRESSION FINISHED. COMPRESSED ${number[0]} files. ${number[1]} Failed, ${number[2]} ignored.`)
        })
        break;
    case 'decompress':
    case 'decomp':
    case 'deco':
    case 'd':
        dvplRecursion(process.cwd(), keeporingals, false).then(number => {
            console.log(`DECOMPRESSION FINISHED. DECOMPRESSED ${number[0]} files. ${number[1]} Failed, ${number[2]} ignored.`)
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
    const dirList = await fs.promises.readdir(originalsDir + "/", { withFileTypes: true });
    return await (dirList.map(async (dirItem) => {
            const isDecompression = !compression && dirItem.isFile() && dirItem.name.endsWith('.dvpl')
            const isCompression = compression && dirItem.isFile() && !dirItem.name.endsWith('.dvpl')
            if (dirItem.isDirectory()) {
                return await dvplRecursion(originalsDir + "/" + dirItem.name, keepOrignals, compression)
            }
            else if (isDecompression || isCompression) {
                try {
                    const fileData = fs.readFileSync(originalsDir + "/" + dirItem.name)
                    const processedBlock = isCompression ? dvpl.compressDVPl(fileData) : dvpl.decompressDVPL(fileData);
                    const newName = path.basename(dirItem.name, '.dvpl')
                    fs.writeFileSync(originalsDir + "/" + (isCompression ? dirItem.name + ".dvpl" : newName), processedBlock)
                    console.log(`File ${originalsDir + "/" + dirItem.name} has been successfully ${isCompression ? "compressed" : "decompressed"} into ${originalsDir + "/" + isCompression ? newName : dirItem.name + ".dvpl"}`)
                    keepOrignals ? undefined : fs.unlinkSync(originalsDir + "/" + dirItem.name);
                    return [1,0,0]
                } catch (err) {
                    console.log(`File ${originalsDir + "/" + dirItem.name} Failed to convert due to ${err}`)
                    return [0,1,0]
                }
            } else {
                return [0,0,1]
            }
        })).reduce(async (a, b) => {
            const na = await a;
            const nb = await b;
            return na.map((x,i) => x + nb[i])
        }, Promise.resolve([0,0,0]))
}