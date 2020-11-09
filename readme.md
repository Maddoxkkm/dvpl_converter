# DVPL and LZ4 relationship

`.dvpl` is a new file format that is first seen used in the World of Tanks Blitz Client for Chinese Server, and now it's used on all known clients, except files that are contained within Android apks.

This converter aims to be able to directly convert between .dvpl and standard non-dvpl files.


## Set up environment for conversion

- Install Node.js for your environment (https://nodejs.org/en/), download the Recommended version
- Setup environment for Node-gyp (https://github.com/nodejs/node-gyp) scroll down to "Installation"
    - for Windows you should only need to do a simple command
    - read the readme in that repo for what you'll need, and install them before proceeding.
- clone this repo
- in the directory execute `npm install` to install the dependencies that are required for the extractor
- in the directory execute the command `npm install -g` (or `sudo npm install -g` for MacOS and Linux) (to install the extractor globally to be used)
- now you can execute this compressor/ decompressor anywhere with `dvpl`.


## Things that have been identified:

- DVPL files are non-dvpl files compressed in LZ4_HC format, With custom footer data.
- The last 20 bytes in DVPL files are in the following format:
    - 32-bit (4 byte) input size in Byte, encoded in little-Endian;
    - 32-bit (4 byte) compressed block size in Byte, encoded in little-Endian;
    - 32-bit (4 byte) compressed block crc32, encoded in little-Endian;
    - 32-bit (4 byte) compression Type, encoded in little-Endian;
        - 0: no compression (format used in all uncompressed `.dvpl` files from SmartDLC)
        - 1: unknown (probably LZ4)
        - 2: LZ4_HC (format used in all compressed `.dvpl` files from SmartDLC)    
    - 32-bit (4 byte) Magic Number represents "DVPL" literals in utf8 encoding, encoded in big-Endian.
        
## Files in the Repo for reference:

All Reference File have been moved to `DVPLConverter_Demo` branch.

## libraries used

- `lz4` a port of the LZ4 compression algorithm (https://github.com/pierrec/node-lz4)
- `crc32` for crc32 calculation included in footer for DVPL (might change to another library in future)