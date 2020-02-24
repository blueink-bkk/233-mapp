import express from 'express';
const api = require('./db-blueink');

const assert = require('assert');
const fs = require('fs');
const app = express();

SSR.compileTemplate('article-tp',Assets.getText('views/article.html'))
SSR.compileTemplate('index-tp',Assets.getText('views/index.html'))
SSR.compileTemplate('xref-constructeurs',Assets.getText('views/xref-constructeurs.html'))
SSR.compileTemplate('page',Assets.getText('views/page.html'))

export function startup(){

  /*
  app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Hello World!!!'});
  });
  */

  /*
  app.get('/xp/article/:id', (req, res) => {
    const p1 = api.museum_get_itemx({item_id:req.params.id})
    p1.then(data =>{
//      console.log('data.row:',data.row)
      console.log('data.row.content:',data.row.content)
//      console.log('row:',data.row.content)
      const it = data.row.content;
      const html = SSR.render('article-tp',{
        it:it,
//        isTranscription:false,
        isTranscription: ()=>{
          return (it.flag && (it.flag == 'T'));
        },
        part: (x)=>{
          if (x>0) {
            return `part:${x+1} - `;
          }
        },
        _: function(key){return TAPi18n.__(key)}
      });

      res.status(200).send(html)
    })
    .catch(err =>{
      res.status(200).send(`err:${err}`)
    })
  }); // article
  */


  // ------------------------------------------------------------------------

  app.get('/page/:id', (req, res) => {
    const v = req.params.id.match(/^([0-9]+)/);
    if (!v || v.length < 2) {
      res.status(200).send(`Invalid request.params.id (${req.params.id})`);
      return;
    }

    const item_id = +v[1];
    const p1 = api.museum_get_itemx({item_id:item_id})
    p1.then(data =>{
//      console.log('data.row:',data.row)
//      console.log('data.row.content:',data.row.content)
//      console.log('row:',data.row.content)
      const it = data.row.content;
      it.reserved = (it.flag && (it.flag == 'R'));
      console.log('data.row.content:', it)
      const html = SSR.render('article-tp',{
        it:it,
        doctype: ()=>'<!doctype html>',
//        isTranscription:false,
        isTranscription: ()=>{
          return (it.flag && (it.flag == 'T'));
        },
        part: (x)=>{
          if (x>0) {
            return `part:${x+1} - `;
          }
        },
        _: function(key){return TAPi18n.__(key)}
      });

      res.status(200).send(html)
    })
    .catch(err =>{
      res.status(200).send(`err:${err}`)
    })
  }); // page


  // ------------------------------------------------------------------------

  /*
  app.get('/xp', (req, res) => {
    res.redirect('/xp/index')
  });
  */


  // liste chronologique des articles (html)
  app.get('/index', (req, res) => {
  //  res.status(200).send('index from node-express')
    const etime = new Date().getTime();
    const p1 = api.museum_index(604)
    //console.log('p1:',p1)

    p1.then(data =>{
      const html = SSR.render('index-tp',{
        list: data.rows
      })
      res.status(200).send(html)
    })
    .catch(err =>{
      res.status(200).send(`err:${err}`)
    })
  }); // index


  app.get('/index-constructeurs', require('./xref-constructeurs.js'))

  app.get('/sitemap.txt', (req,res)=>{
    api.museum_index(604)
    .then(data => {
      const list = data.rows.sort()
              .map(it=>`http://museum.ultimheat.com/page/${it.id}-${it.yp}-${it.h1}-${it.h2}`);
      res.setHeader('content-type', 'text/plain');
      res.status(200).send(list.join('\n'))
    })
    .catch(err => {
      res.status(200).send(`err:${err}`)
    })
  })


  app.get('/sitemap-pdf.txt', (req,res)=>{
    api.museum_sitemap_pdf()
    .then(data => {
      const list = data.rows.sort()
              .map(it=>`http://museum-assets.ultimheat.com/pdf-www/${it}.pdf`);
      res.setHeader('content-type', 'text/plain');
      res.status(200).send(list.join('\n'))
    })
    .catch(err => {
      res.status(200).send(`err:${err}`)
    })
  })

  app.get('/sitemap-img.txt', (req,res)=>{
    api.museum_sitemap_img()
    .then(data => {
      const list = data.rows.sort()
              .map(it=>`http://museum-assets.ultimheat.com/jpeg-www/${it}.jpg`);
      res.setHeader('content-type', 'text/plain');
      res.status(200).send(list.join('\n'))
    })
    .catch(err => {
      res.status(200).send(`err:${err}`)
    })
  })

  // --------------------------------------------------------------------------
  app.get('/ad-server', require('./xpress/ad-server.js').send_file);
  // --------------------------------------------------------------------------
  app.get('/page/:id', (req,res)=>{
    console.log('page id:',req.params.id);
    res.status(200).send('page id:'+req.params.id);
  })
  // --------------------------------------------------------------------------
  WebApp.connectHandlers.use(app);
} // startup
