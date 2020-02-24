import express from 'express';

const assert = require('assert');
const os = require('os');
const fs = require('fs-extra');
const path = require('path')
const inspect = require('util').inspect;

const app = express();
var Busboy = require('busboy');

WebApp.connectHandlers.use(app);

var device = require('express-device');
app.use(device.capture());

//const bodyParser = require("body-parser");
//app.use(bodyParser.urlencoded({ extended: true }));

//const formidable = require("express-formidable");
//app.use(formidable());

//const file_Upload = require('express-fileupload');
//app.use(file_Upload());


//const cms = require('../cms-server.js');

import {sitemap} from './sitemap.js'

SSR.compileTemplate('page-template',Assets.getText('views/page-template.html'))
//SSR.compileTemplate('article-tp',Assets.getText('views/article.html'))
//SSR.compileTemplate('index-tp',Assets.getText('views/index.html'))
SSR.compileTemplate('xref-constructeurs',Assets.getText('views/xref-constructeurs.html'))
SSR.compileTemplate('page',Assets.getText('views/page.html'))
SSR.compileTemplate('catalogs',Assets.getText('views/catalogs.html'))
SSR.compileTemplate('phone-welcome',Assets.getText('views/phone-welcome.html'))

app.get('/xref-constructeurs', require('./xref-constructeurs.js'))
app.get('/catalogs', require('./catalogs.js'))
app.get('/page/:id', require('./page.js'))
app.get('/ping', require('./ping.js'))

app.get('/pub-tester2', require('./pub-tester2'))

//app.use('/upload2', express.static(__dirname + '/upload2.html'));
//app.use('/upload2', express.static(__dirname + '/upload2.html'));
app.get('/upload2', require('./upload2.js'))

/*
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.get('/upload2', require('./upload2'))
*/

app.get('/sitemap.txt', (req,res)=>{
  return sitemap()
  .then(html => {
    res.setHeader('content-type', 'text/plain');
    res.status(200).send(html)
  })
  .catch(err => {
    res.status(200).send(`err:${err}`)
  })
})

/*
    All uploads go to museum-assets
*/

//function museum_assets(folder) {
const env = process.env.METEOR_SETTINGS && JSON.parse(process.env.METEOR_SETTINGS)
if (!env) {
  throw new Meteor.Error('FATAL: expecting environment file (.env.json)') 
}
const museum_assets = env['museum-assets'];

assert(museum_assets, 'fatal-@75 museum-asset undefined.')

app.post('/gateway/:fn', function(req, res) {

  const create_subfolder = true; // could be controlled by the client.
  console.log('>>>/gateway req.params:',req.params)
  /*
  //console.log('>>>/gateway req.headers:',req.headers)
  console.log('>>>/gateway req.fields:',req.fields)
  console.log('>>>/gateway req.body:',req.body)
  */
  //console.log(`/gateway req.files :`,Object.keys(req.files));

  /*
  const fp = path.join(museum_assets,folder);
  if (!fs.existsSync(fp)) {
    console.log(`ALERT: <${fp}> not-found`);
    console.log(`-- museum-assets: ${museum_assets}`);
    console.log(env)
    console.log(`ALERT: <${fp}> folder-snot-found`);
    throw new Meteor.Error('folder-not-found',`<${fp}/${folder}> folder does not exists.`)
  }*/

  /*******************************
  if (false) {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', function(data) {
          console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });
      file.on('end', function() {
            console.log('File [' + fieldname + '] Finished');
      });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
          console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function() {
          console.log('Done parsing form!');
          res.writeHead(303, { Connection: 'close', Location: '/' });
          res.end();
    });

    req.pipe(busboy);
  }
  ***********************/


  if (true) {
    const busboy = new Busboy({ headers: req.headers });
    const o ={};
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      /*
          MAKE SURE SUBFOLDERS EXIST.
      */
      //       var saveTo = path.join(os.tmpDir(), path.basename(fieldname));
      if (false) {
        console.log(`--on-file o:`,o)
        console.log(`--on-file file:`,file)
        console.log(`--on-file filename:`,filename)
      }
      // assert(file.name) ?????
      const saveTo = path.join(museum_assets,o.webkitRelativePath);
      const dirname = path.dirname(saveTo);

      if (create_subfolder) {
        fs.ensureDirSync(dirname);
      }


      if (!fs.existsSync(dirname)) {
        console.log(`ALERT: <${dirname}> not-found`);
        console.log(`-- museum-assets: ${museum_assets}`);
        console.log(env)
        console.log(`ALERT: <${dirname}> folder-not-found`);
        res.writeHead(500, { Connection: 'close', Location: '/' });
        res.end();
//        throw new Meteor.Error('folder-not-found',`<${dirname}> folder does not exists.`)
        return;
      }

       //const saveTo = path.join(os.tmpDir(), filename);
      console.log(`--on-file:<${fieldname}><${filename}> saveTo:${saveTo}`);
      file.pipe(fs.createWriteStream(saveTo));
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      o[fieldname] = val;
    });

    busboy.on('fieldLimit', ()=>{
      console.log('-- fieldLimit');
    });
    busboy.on('partsLimit', ()=>{
      console.log('-- partsLimit');
    });
    busboy.on('filesLimit', ()=>{
      console.log('-- filesLimit');
    });

    busboy.on('finish', function() {
      for( var field in req.files ) {
        console.log(`### ${field}`)
      }

      console.log('busboy :: Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });

    console.log('firing busboy o:',o)
    req.pipe(busboy);
  }



return;


/*****************************************

  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  Object.keys(req.files).forEach(key=>{
    const file = req.files[key];
    console.log(`--file:`,file)
  })

    res.send('(from map-32022) File uploaded!');
return;

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./1.jpg', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('(from map-32022) File uploaded!');
  });
return;

  if (!req.formData) {
    console.log('req:',Object.keys(req))
    return res.status(400).send('formData not found.');
  }

  res.send('OK');
return;
****************************/
});

/*
Meteor.startup(()=>{
  console.log(`http-server Meteor.startup.`);
})
*/
