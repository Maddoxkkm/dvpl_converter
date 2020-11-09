# About DVPL

`.dvpl` is a new file format that is first seen used in the World of Tanks Blitz Client for Chinese Server, and now it's used on all known clients, except files that are contained within Android apks.

This converter aims to be able to directly convert between .dvpl and standard non-dvpl files.


## Set up environment for conversion

- Install Node.js for your environment (https://nodejs.org/en/), download the Recommended version
- Setup environment for Node-gyp (https://github.com/nodejs/node-gyp) scroll down to "Installation"
    - for Windows you should only need to do a simple command
    - read the readme in that repo for what you'll need, and install them before proceeding.
- Clone this repo / Download this entire repo to your device.
- enter the directory where package.json sits with command line, and install with the following commands:
    1. `npm install`
    2. `npm install -g` or `sudo npm install -g` for linux
- now you can execute this compressor/ decompressor anywhere with `dvpl` in commandline.

### Example
```
PS E:\DVPL_DECOMPRESS> dvpl decompress
File E:\DVPL_DECOMPRESS/XML/chassis_effects.yaml.dvpl has been successfully decompressed into chassis_effects.yaml
File E:\DVPL_DECOMPRESS/XML/explosion_effects.yaml.dvpl has been successfully decompressed into explosion_effects.yaml
File E:\DVPL_DECOMPRESS/XML/right_border.xml.dvpl has been successfully decompressed into right_border.xml
File E:\DVPL_DECOMPRESS/XML/item_defs/achievements.yaml.dvpl has been successfully decompressed into achievements.yaml
File E:\DVPL_DECOMPRESS/XML/item_defs/item_types.xml.dvpl has been successfully decompressed into item_types.xml
File E:\DVPL_DECOMPRESS/XML/material_kinds.xml.dvpl has been successfully decompressed into material_kinds.xml
.
.
.
.
DECOMPRESSION FINISHED. DECOMPRESSED 631 files.
```

## DVPL Specification:

- Starts with stream of Byte data, can be compressed or uncompressed.
- The last 20 bytes in DVPL files are in the following format:
    - UINT32LE input size in Byte
    - UINT32LE compressed block size in Byte
    - UINT32LE compressed block crc32
    - UINT32LE compression Type
        - 0: no compression (format used in all uncompressed `.dvpl` files from SmartDLC)
        - 1: LZ4 (not observed but handled by this decompressor)
        - 2: LZ4_HC (format used in all compressed `.dvpl` files from SmartDLC)
        - 3: RFC1951 (not implemented in this decompressor since it's not observed)    
    - 32-bit Magic Number represents "DVPL" literals in utf8 encoding, encoded in big-Endian.        

## libraries used

- `lz4` a port of the LZ4 compression algorithm (https://github.com/pierrec/node-lz4)
- `crc32` for crc32 calculation included in footer for DVPL