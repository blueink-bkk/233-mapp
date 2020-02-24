import {cms, db, package_id, _assert} from '../cms-api.js';
const assert = require('assert');
const fs = require('fs');

var counter =0;
const files =[];

module.exports = function(req,res) {
  const etime = new Date().getTime();

  if (files.length <=0) {
    Meteor.call('get-pub-directory', (err, _files)=>{
      if (err) throw err;
      console.log(`get-pub-directory _files=>`,_files.length)
      files.push(..._files)
      console.log(`get-pub-directory files=>`,files.length)
      res.status(200)
      .send(`counter:${++counter}`)
//      .send(files.join(`<br>\n`))
    })
    return;
  }

  counter++;
  const i = counter % files.length;
  res.status(200)
  .send(`
    <h1>PUB ${i}</h1>
    ${files[i]}
    `)

}

/*
res.status(200)
  .end(SSR.render('page-template',{
    html:html
  }));
})
.catch(err =>{
res.status(200).send(`err:${err}`)
})

*/
