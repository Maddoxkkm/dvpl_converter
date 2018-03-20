# DVPL and LZ4 relationship

`.dvpl` is a new file format that is first seen used in the World of Tanks Blitz Client for Chinese Server, and also recently seen in Public Open Test Clients. 

This converter aims to be able to directly convert between .dvpl and standard non-dvpl files.

## Work in progress
 
there are a few things that need to be addressed:
- there are some unidentified headers and tail data in both lz4 file and dvpl file. will need to figure a bit more about them
- set this as a usual script so it can be used to pack and unpack large directories.
- improve it so it can also perform conversion on zipped files.

## Things that have been identified:

- DVPL files are non-dvpl files compressed in LZ4_HC format, with frame header stripped and appended some footer instead (see below)
- The last 20 bytes in DVPL files are in the following format (code extracted from Dava Engine), assumption is that each attribute listed below is 4 bytes long:

```c++
// all nice, now write footer to file, then rename it
// write 20 bytes LitePack footer
PackFormat::LitePack::Footer footer = { sizeUncompressed,
                                        sizeCompressed,
                                        crc32Compressed,
                                        compressionType,
                                        PackFormat::FILE_MARKER_LITE };
```
- The first 11 bytes in lz4 files are the Frame Header and Block Length (which are stripped and not present in dvpl files.)

```
04 22 4d 18     magic number
64 70 b9        3-byte frame descriptor
da 82 07 00     block length (492250 bytes here)
84 7f 45 4c 46  LZ4-compressed data (ie. tag byte 0x84 followed by
...               the literal "\x7fELF\1\1\1\0" and so on)
```

## Files in the Repo for reference:

- `Extracted/barrel_2_dust.yaml` a sample file extracted from a `.dvpk` file, which is the archive format of the Smart DLC package

- `Extracted/barrel_2_dust.yaml.dvpl` a sample `.dvpl` file extracted from a `.dvpk` file (same `.dvpk` file as the above sample)

- `Converted/test.lz4`, `Converted/test2.lz4` both files are converted and compressed with LZ4_HC format, using `dvpl_convert.js` to convert them. Both came from the same original file `Extracted/barrel_2_dust.yaml` so just placed both so we can understand it more.


## libraries used

- `lz4` a port of the LZ4 compression algorithm (https://github.com/pierrec/node-lz4)