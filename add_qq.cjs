const fs = require('fs');
let content = fs.readFileSync('services/translations.ts', 'utf8');

// Update Language type
content = content.replace(/export type Language = 'uz' \| 'ru' \| 'en';/, "export type Language = 'uz' | 'ru' | 'en' | 'qq';");

// Use regex to add qq property to translation objects
content = content.replace(/en:\s*('[^']*'|"[^"]*")\s*\}/g, (match, enVal) => {
    return `en: ${enVal}, qq: ${enVal} }`;
});

fs.writeFileSync('services/translations.ts', content);
console.log('Done');
