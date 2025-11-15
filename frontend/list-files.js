const fs = require("fs");
const path = require("path");
 
function printDirectory(dir, prefix = "") {
  const files = fs.readdirSync(dir);
 
  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const stats = fs.statSync(filePath);
 
    console.log(`${prefix}${isLast ? "└──" : "├──"} ${file}`);
 
    if (stats.isDirectory()) {
      printDirectory(filePath, `${prefix}${isLast ? "    " : "│   "}`);
    }
  });
}
 
printDirectory("./");