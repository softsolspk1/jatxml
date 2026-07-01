const fs = require('fs');
let data = fs.readFileSync('src/lib/xml/htmlConverter.ts', 'utf8');
data = data.replace(/\\\$\{/g, '${');
data = data.replace(/\\`/g, '`');
fs.writeFileSync('src/lib/xml/htmlConverter.ts', data);
console.log('Fixed');
