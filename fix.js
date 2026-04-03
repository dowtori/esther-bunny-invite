const fs = require('fs');
const content = fs.readFileSync('teumgyul-mega1.html', 'utf8');
fs.writeFileSync('teumgyul-mega2.html', content.replace("const T = '1';", "const T = '2';"), 'utf8');
fs.writeFileSync('teumgyul-unboxing.html', content.replace("const T = '1';", "const T = '3';"), 'utf8');
fs.writeFileSync('teumgyul-paid.html', content.replace("const T = '1';", "const T = '4';"), 'utf8');
console.log('Fixed Encoding!');
