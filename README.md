# Reproduction of pkg `fs.lstatSync` error in Snapshot filesystem

This example reproduces an error in [`pkg`](https://www.npmjs.com/package/pkg) when using the Snapshot (`/snapshot`)
filesystem. The error surfaces when the popular [`fast-glob`](https://www.npmjs.com/package/fast-glob) package is used
to locate files using a _static_ pattern (e.g. exact file path).

To reproduce, run the following commands:

```shell
nvm use
npm install
npm run glob # Observe correct lookup of "Package entries" using fast-glob
npm run package-macos # Adjust for Linux etc
./pkg-fast-glob-lstat-error
```

After executing the above, the following error is thrown:
```
Current dir: /snapshot/pkg-fast-glob-lstat-error/src
/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/readers/sync.js:36
            throw error;
            ^

TypeError: Cannot read properties of undefined (reading 'bind')
    at new DirentFromStats (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/utils/fs.js:7:50)
    at Object.createDirentFromStats (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/utils/fs.js:17:12)
    at ReaderSync._makeEntry (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/readers/reader.js:22:30)
    at ReaderSync._getEntry (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/readers/sync.js:30:25)
    at ReaderSync.static (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/readers/sync.js:19:32)
    at ProviderSync.api (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/providers/sync.js:20:29)
    at ProviderSync.read (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/providers/sync.js:13:30)
    at Array.map (<anonymous>)
    at getWorks (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/index.js:59:18)
    at AsyncFunction.sync (/snapshot/pkg-fast-glob-lstat-error/node_modules/fast-glob/out/index.js:20:23)
```

The above stack trace points to a failure in line 
```javascript
this.isBlockDevice = stats.isBlockDevice.bind(stats);
```

of the following JS source:

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDirentFromStats = void 0;
class DirentFromStats {
    constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
    }
}
function createDirentFromStats(name, stats) {
    return new DirentFromStats(name, stats);
}
exports.createDirentFromStats = createDirentFromStats;
```

The `pkg` `fs` implementation does not provide implementations of `stats.isBlockDevice` and `stats.isCharacterDevice`
for the Snapshot file system.
