const fs = require('fs');
const html = fs.readFileSync('c:/React/vikram-portfolio/index.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(200, 310).join('\n'));
