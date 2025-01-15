# Resolve Bin

Resolves the full path to the bin file of a given package by inspecting the `"bin"` field in its `package.json`.

## Installation

```sh
npm install @smushytaco/resolve-bin
```

## Usage

```javascript
import { resolveBin, resolveBinSync } from '@smushytaco/resolve-bin';

// Asynchronous usage
// package.json: "bin": "bin/tap.js"
(async () => {
    try {
        const bin = await resolveBin('tap');
        console.log(bin);
        // => [..]/resolve-bin/node_modules/tap/bin/tap.js
    } catch (err) {
        console.error(err);
    }
})();

// Synchronous usage
try {
    const bin = resolveBinSync('tap');
    console.log(bin);
    // => [..]/resolve-bin/node_modules/tap/bin/tap.js
} catch (err) {
    console.error(err);
}
```

## API

See type declarations.
