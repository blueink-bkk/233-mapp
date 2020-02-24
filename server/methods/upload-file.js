const fs = require('fs');
const path = require('path');
//const xattr = require('fs-xattr');

import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'upload-file': (file, fileData)=>{
    console.log(`Uploading-file file:`, file);
    console.log(`Uploading-file buffer.size:`, fileData.length);
//    _assert(file.hashtag)
//    console.log(`Uploading-file cmd.file:`, buffer);
    const folder = path.dirname(file.webkitRelativePath);

    const env = JSON.parse(process.env.METEOR_SETTINGS)
    console.log(`process.env.museum-assets:`, env);
    const museum_assets = env['museum-assets'];
    const fp = path.join(museum_assets,folder);
    console.log(`method::upload-file (${folder}) =>`,fp);

    if (!fs.existsSync(fp)) {
      console.log(`ALERT: <${fp}> not-found`)
      throw new Meteor.Error('invalid-folder',`<${folder}> folder does not exists.`)
    }

    const fileName = path.join(fp,file.name);
    console.log(`method::upload-file write =>(${fileName})`);
    fs.writeFileSync(fileName, fileData, 'binary');
//    _assert(file.checksum,file.checksum,'fatal-@28.')
//    xattr.setSync(fileName, 'user.checksum', file.checksum)
    xattr.setSync(fileName, 'user.lastModified', file.lastModified.toString())
    xattr.setSync(fileName, 'user.lastModifiedDate', file.lastModifiedDate.toString());
    xattr.setSync(fileName, 'user.hash-tag', 'dkz-3.14');
    xattr.setSync(fileName, 'user.hashtag', 'dkz3.14');
//    fs.writeFileSync(fileName, new Buffer(fileData), encoding);
    console.log(`success cmd:`,file)
    const x = xattr.getSync(fileName, 'user.hashtag');
    console.log(`success user.hashtag: (${String.fromCharCode(...x)})`);
    const y = xattr.getSync(fileName, 'user.hash-tag');
    console.log(`success user.hash-tag: (${String.fromCharCode(...y)})`);
  }
})
