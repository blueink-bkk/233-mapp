import {db, package_id, _assert } from '../cms-api.js';
const fs = require('fs');
const path = require('path');
//const xattr = require('fs-xattr');

async function get_directory(folder) {
}

function *walkSync(dir,patterns) {
  const files = fs.readdirSync(dir, 'utf8');
//  console.log(`scanning-dir: <${dir}>`)
  for (const file of files) {
    try {
      const pathToFile = path.join(dir, file);
      if (file.startsWith('.')) continue; // should be an option to --exclude
        const fstat = fs.statSync(pathToFile);
      const isSymbolicLink = fs.statSync(pathToFile).isSymbolicLink();
      if (isSymbolicLink) continue;

      const isDirectory = fs.statSync(pathToFile).isDirectory();
      if (isDirectory) {
        if (file.startsWith('.')) continue;
          yield *walkSync(pathToFile, patterns);
      } else {
        if (file.startsWith('.')) continue;
        let failed = false;
        if (patterns && patterns.length>0) {
          for (pat of patterns) {
            const regex = new RegExp(pat,'gi');
            if (file.match(regex)) continue;
            failed = true;
            break;
          };
        }
        if (!failed) {
          yield pathToFile;
        }
      }
    }
    catch(err) {
      console.log(`ALERT on file:${ path.join(dir, file)} err:`,err)
//      console.log(`ALERT err:`,err)
      continue;
    }
  }
}

/*
    Here, folder was found from the first file in fileInput.files.
*/

Meteor.methods({
  'assets-folder-directory': (folder)=>{
    const env = JSON.parse(process.env.METEOR_SETTINGS)
    console.log(`process.env.museum-assets:`, env);
    const museum_assets = env['museum-assets'];
    const fp = path.join(museum_assets,folder);
    console.log(`method::assets-folder-directory (${folder}) =>`,fp);
    if (!fs.existsSync(fp)) {
      console.log(`ALERT: <${fp}> not-found`)
      throw new Meteor.Error('invalid-folder',`<${fp}> folder does not exists.`,)
    }

//    const dir = fs.readdirSync(fp)
    const dir =[];
    for (const fn of walkSync(fp)) {
      dir.push(fn)
    }

    console.log('directory:',dir)
//    throw 'stop-@71'
    const _dir = dir.map(name=>{
//      const stat = fs.statSync(path.join(fp,name));
//      const fn = path.join(fp,name);
      const fn = name; // full-name
      const stat = fs.statSync(fn);
      let checksum;
      let lastModified;
      let lastModifiedDate;
      try {
        const uint8array = xattr.getSync(fn, 'user.checksum')
//        checksum = new TextDecoder("utf-8").decode(uint8array);
        checksum = String.fromCharCode(...uint8array);
        _assert(typeof checksum == 'string', typeof checksum, 'fatal-@29');

        lastModified = String.fromCharCode(...xattr.getSync(fn, 'user.lastModified'));
        (()=>{
          const x = xattr.getSync(fn, 'user.lastModifiedDate');
          lastModifiedDate = String.fromCharCode(...x);
          console.log(`lastModifiedDate ${lastModifiedDate} <=`,lastModifiedDate)
        })()
      } catch(err) {
        console.log(`warning(ignored): xattr.getSync(${fn},'user.checksum') err:`,err)
        //throw new Meteor.Error('xattr-error',err)
      }
      /*
      const {size, mtimeMs, ctimeMs, birthtimeMs, mtime, ctime, birthtime} = stat;
      return {
        name, size, mtimeMs, ctimeMs, birthtimeMs, mtime, ctime, birthtime, checksum, lastModified, lastModifiedDate
      }*/

      return Object.assign(stat, {
        name: name.replace(fp,''),
        checksum, lastModified, lastModifiedDate,
        tag:'dkz-hello'
      })
    });
    return _dir;
  }
})
