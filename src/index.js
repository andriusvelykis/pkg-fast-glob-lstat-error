#!/usr/bin/env node

const fg = require('fast-glob');
const path = require('path');

console.log("Current dir: " + __dirname);

const entries = fg.sync([path.join(__dirname, 'myfiles', 'hello.js')], { dot: true });

console.log("Packaged entries: " + entries.toString());
