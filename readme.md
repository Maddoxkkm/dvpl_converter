# DVPL and LZ4 relationship

`.dvpl` is a new file format that is first seen used in the World of Tanks Blitz Client for Chinese Server, and also recently seen in Public Open Test Clients. 

This converter aims to be able to directly convert between .dvpl and standard non-dvpl files.

## Work in progress
 
there are a few things that need to be addressed:

- [x] there are some unidentified headers and tail data in both lz4 file and dvpl file. will need to figure a bit more about them
- [ ] setup usual scripts so it can be used to pack and unpack large directories.
- [ ] Build a GUI interface to convert between the two without the need of Node.js and dependencies installed (Electron might be used)
- [ ] improve it so it can also perform conversion on zipped files.

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
- `buffer-crc32` for crc32 calculation included in footer for DVPL (might change to another library in future)