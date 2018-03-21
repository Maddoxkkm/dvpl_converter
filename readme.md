# DVPL and LZ4 relationship

`.dvpl` is a new file format that is first seen used in the World of Tanks Blitz Client for Chinese Server, and also recently seen in Public Open Test Clients. 

This converter aims to be able to directly convert between .dvpl and standard non-dvpl files.

## Work in progress
 
there are a few things that need to be addressed:

- [x] there are some unidentified headers and tail data in both lz4 file and dvpl file. will need to figure a bit more about them
- [ ] set this as a usual script so it can be used to pack and unpack large directories.
- [ ] improve it so it can also perform conversion on zipped files.

## Things that have been identified:

- DVPL files are non-dvpl files compressed in LZ4_HC format, with frame header stripped and appended some footer instead (see below)

- The last 20 bytes in DVPL files are in the following format (code extracted from Dava Engine), assumption is that each attribute listed below is 4 bytes long:

    - 32-bit (4 byte) input size in Byte, encoded in little-Endian;
    
    - 32-bit (4 byte) compressed block size in Byte, encoded in little-Endian;
    
    - 32-bit (4 byte) compressed block crc32, encoded in little-Endian;
    
    - 32-bit (4 byte) compression Type, encoded in little-Endian;
    
        - 0: no compression (format used in all uncompressed `.dvpl` files from SmartDLC)
        
        - 1: unknown (probably LZ4)
        
        - 2: LZ4_HC (format used in all compressed `.dvpl` files from SmartDLC)
        
## Files in the Repo for reference:

- `Extracted/barrel_2_dust.yaml` a sample file extracted from a `.dvpk` file, which is the archive format of the Smart DLC package

- `Extracted/barrel_2_dust.yaml.dvpl` a sample `.dvpl` file extracted from a `.dvpk` file (same `.dvpk` file as the above sample)

- `Converted/test.lz4` converted and compressed with LZ4_HC format, using an old version of `dvpl_convert.js` to convert them. came from the same original file `Extracted/barrel_2_dust.yaml` so just placed both so we can understand it more.

- `Converted/test2.lz4` converted and compressed with LZ4_HC format, using `dvpl_convert.js` to convert them, difference between this and `test.lz4` is that this is converted as a Block, instead of a stream, so no header/footer tags. came from the same original file `Extracted/barrel_2_dust.yaml` so just placed both so we can understand it more.

- `test.lz4.dvpl` is a file converted into DVPL format successfully. Original file is `Extracted/barrel_2_dust.yaml`.


## libraries used

- `lz4` a port of the LZ4 compression algorithm (https://github.com/pierrec/node-lz4)

- `buffer-crc32` for crc32 calculation included in footer for DVPL (might change to another library in future)