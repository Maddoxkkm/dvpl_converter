# About DVPL

`.dvpl` is a new file format that is first seen used in the World of Tanks Blitz Client for Chinese Server, and now it's used on all known clients, except files that are contained within Android apks.

This converter aims to be able to directly convert between .dvpl and standard non-dvpl files.


## Set up environment for conversion

- Install Node.js for your environment (https://nodejs.org/en/), download the Recommended version
- Setup environment for Node-gyp (https://github.com/nodejs/node-gyp) scroll down to "Installation"
    - for Windows you should only need to do a simple command
    - read the readme in that repo for what you'll need, and install them before proceeding.
- with commandline interface install with `npm install -g https://github.com/Maddoxkkm/dvpl_converter` (or with `sudo` if linux, and change it to a sensible link that you're currently reading from.)
- now you can execute this compressor/ decompressor anywhere with `dvpl` in commandline.

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