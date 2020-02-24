import {cms, db, package_id, _assert} from '../cms-api.js';
const assert = require('assert');
const fs = require('fs');

SSR.compileTemplate('upload2',Assets.getText('views/upload2.html'))

module.exports = function(req,res) {
  const html = SSR.render('upload2',{
      /*
      it:page,
      isTranscription: ()=>{
        return (page.data.transcription);
      },
      part: (x)=>{
        if (x>0) {
          return `part:${x+1} - `;
        }
      },*/
      _: function(key){return TAPi18n.__(key)}
  });
  res.status(200)
  .end(html);
  return;
};

/*
module.exports = function(req,res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
};
*/
