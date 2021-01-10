const path = require('path');
const fs = require('fs');

exports.isDir = (filePath) => {
  return (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory());
}

exports.removeDir = (path) => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(filename => {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          exports.removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
    return true;
  } else {
    return false;
    console.log("Directory path not found.")
  }
}

exports.mkdir = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, {recursive:true}, (err) => {
      if (err) {
        return reject('Failed to create cache directory: ' + dirPath )
      } else {
        return resolve(true)
      }
    })
  });
}

/**
 * @description Camel-cases baseName of filename. eg: about-our_company.jsx -> AboutOurCompany
 * @param fileName
 * @returns {string}
 */
exports.fileNameToComponentName = fileName => {
  fileName = path.basename(fileName)
    .toLowerCase()
    .replace(/\.\w+$/, '')
  const matches = fileName.matchAll(/(?:(\-|\_)\w)/g);
  for (let match of matches) {
    let str = match[0].toUpperCase().replace('-', '');
    fileName = fileName.replace(match[0], str);
  }
  fileName = fileName[0].toUpperCase()
    .concat(fileName.substr(1));
  return fileName;
}

/**
 * @description Gets file extension from url string
 * @param url {string}
 * @returns {string|boolean} File extension
 */
exports.getFileExtension = (url="") => {
  url = url.replace(/\?.*$/, '');
  let match = url.match(/\.(\w+)$/);
  if (!match) return false;
  return match[1].toLowerCase();
}

exports.getFileExt = exports.getFileExtension;
