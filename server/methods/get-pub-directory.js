const fs = require('fs');
const path = require('path');
const walk = require('klaw')

Meteor.methods({
  'get-pub-directory': (o)=>{
    console.log(`get-pub-directory o:`,o);
    const pub_folder = '/media/dkz/Seagate/2019-museum-assets/museum-pub/';
    if (!fs.existsSync(pub_folder)) {
      throw new Meteor.Error('file-not-found',`<${pub_folder}> folder-not-found`);
    } //return {error:'folder-not-found'};

    const files = [];
    return new Promise((resolve,reject)=>{
      walk(pub_folder)
      .on('data', (it) => {
        if (!it.path.endsWith('.jpg') && !it.path.endsWith('.png')) return;
        files.push(it.path.replace(pub_folder,''));
      })
      .on('end', ()=>{
        console.log('files:',files)
        resolve(files)
      })
    })
  }
});
