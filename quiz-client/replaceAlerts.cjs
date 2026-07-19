const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles() {
  const pagesDir = path.join(__dirname, 'src', 'pages');
  
  walkDir(pagesDir, (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let modified = false;

    // Check if file has inline alerts
    if (content.includes('className="alert alert-danger"') || content.includes("className='alert alert-danger'") ||
        content.includes('className="alert alert-success"') || content.includes("className='alert alert-success'")) {
        
      // Replace Error Alerts
      // Pattern: {error && <div className="alert alert-danger">...{error}</div>} or similar
      const errorRegex = /\{error\s*&&\s*<div[^>]*alert-danger[^>]*>[\s\S]*?\{error\}<\/div>\}/g;
      const errorRegex2 = /\{error\s*&&\s*<div[^>]*alert-danger[^>]*>[\s\S]*?<\/div>\}/g; // looser
      const errorRegex3 = /\{pwError\s*&&\s*<div[^>]*alert-danger[^>]*>[\s\S]*?<\/div>\}/g;

      content = content.replace(errorRegex2, '<Popup type="error" message={error} clear={setError} />');
      content = content.replace(errorRegex3, '<Popup type="error" message={pwError} clear={setPwError} />');

      // Replace Success Alerts
      const successRegex = /\{success\s*&&\s*<div[^>]*alert-success[^>]*>[\s\S]*?<\/div>\}/g;
      const successRegex2 = /\{pwSuccess\s*&&\s*<div[^>]*alert-success[^>]*>[\s\S]*?<\/div>\}/g;

      content = content.replace(successRegex, '<Popup type="success" message={success} clear={setSuccess} />');
      content = content.replace(successRegex2, '<Popup type="success" message={pwSuccess} clear={setPwSuccess} />');

      if (content !== original) {
        // Add import at the top
        // determine relative path to src/components/Popup
        // depth calculation
        const depth = filePath.split(path.sep).length - pagesDir.split(path.sep).length;
        let relativePath = '';
        if (depth === 1) relativePath = '../components/Popup';
        else if (depth === 2) relativePath = '../../components/Popup';
        else if (depth === 3) relativePath = '../../../components/Popup';
        else relativePath = '../components/Popup'; // fallback

        if (!content.includes('import Popup from')) {
          // insert after React import
          content = content.replace(/(import React[^;]*;)/, `$1\nimport Popup from '${relativePath}';`);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
      }
    }
  });
}

processFiles();
console.log('Done replacing alerts!');
