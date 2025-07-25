// Script to convert old semantic tokens to new light/dark structure
// Usage: node generate-tokens-json.js

const fs = require('fs');
const path = require('path');
const tokensData = require('./tokens.json');

const oldSemantics = tokensData;
const updatedSemantics = {};

for (const [name, obj] of Object.entries(oldSemantics)) {
  if (obj.value) {
    if (name.endsWith('-dark')) {
      const base = name.replace(/-dark$/, '');
      updatedSemantics[base] = updatedSemantics[base] || { type: obj.type, description: obj.description };
      updatedSemantics[base].dark = obj.value;
    } else {
      updatedSemantics[name] = updatedSemantics[name] || { type: obj.type, description: obj.description };
      updatedSemantics[name].light = obj.value;
    }
  }
}

// Output the new structure to a file
ds = JSON.stringify(updatedSemantics, null, 2);
fs.writeFileSync(path.join(__dirname, 'semantic-tokens-merged.json'), ds);
console.log('Merged semantic tokens written to semantic-tokens-merged.json'); 