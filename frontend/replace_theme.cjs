const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /bg-zinc-950/g, replacement: 'bg-green-50' },
  { regex: /bg-zinc-900\/([0-9]+)/g, replacement: 'bg-white/$1' },
  { regex: /bg-zinc-900/g, replacement: 'bg-white' },
  { regex: /bg-zinc-800\/([0-9]+)/g, replacement: 'bg-green-100/$1' },
  { regex: /bg-zinc-800/g, replacement: 'bg-green-50' },
  { regex: /bg-zinc-700/g, replacement: 'bg-green-100' },
  { regex: /border-zinc-800\/([0-9]+)/g, replacement: 'border-green-200/$1' },
  { regex: /border-zinc-800/g, replacement: 'border-green-200' },
  { regex: /border-zinc-700/g, replacement: 'border-green-300' },
  { regex: /text-zinc-100/g, replacement: 'text-green-950' },
  { regex: /text-zinc-200/g, replacement: 'text-green-900' },
  { regex: /text-zinc-300/g, replacement: 'text-green-800' },
  { regex: /text-zinc-400/g, replacement: 'text-gray-600' },
  { regex: /text-zinc-500/g, replacement: 'text-gray-500' },
  { regex: /text-white/g, replacement: 'text-green-950' },
  { regex: /hover:bg-zinc-800/g, replacement: 'hover:bg-green-100' },
  { regex: /hover:bg-zinc-700/g, replacement: 'hover:bg-green-200' },
  { regex: /hover:text-white/g, replacement: 'hover:text-green-900' },
  { regex: /hover:text-zinc-200/g, replacement: 'hover:text-green-800' },
  { regex: /shadow-zinc-900/g, replacement: 'shadow-green-900/10' },
  { regex: /text-lime-500/g, replacement: 'text-green-600' },
  { regex: /bg-lime-500/g, replacement: 'bg-green-600' },
  { regex: /hover:bg-lime-600/g, replacement: 'hover:bg-green-700' },
  { regex: /border-lime-500/g, replacement: 'border-green-500' },
  { regex: /text-emerald-500/g, replacement: 'text-green-700' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done replacing theme classes.');
