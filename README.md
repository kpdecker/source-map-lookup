# Source Map Lookup

Simple script to map source-maped file location to the original source file.

## Installation

```
npm install -g source-map-lookup
```

## Usage

```
source-map-lookup mapFile path line column
```

## Example

```
$ source-map-lookup ./test/test.js.map out.js 4 2
{ source: 'foo.js', line: 17, column: 11, name: 'src' }
```
