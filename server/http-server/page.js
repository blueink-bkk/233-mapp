import {cms, db, package_id, _assert} from '../cms-api.js';
const assert = require('assert');
const fs = require('fs');


module.exports = function(req,res) {
  const etime = new Date().getTime();

  _assert(db,db,'Missing db')
  _assert(package_id,package_id,'Missing package_id')

  const v = req.params.id.match(/^([0-9]+)/);
  if (!v || v.length < 2) {
    res.status(200).send(`Invalid request.params.id (${req.params.id})`);
    return;
  }

  const item_id = +v[1];

  return db.query(`
    select *
    from cms_articles__directory
    where item_id = $1
    ;`,[item_id],{single:true})
  .then( page =>{
    const html = SSR.render('page',{
      it:page,
      isTranscription: ()=>{
        return (page.data.transcription);
      },
      part: (x)=>{
        if (x>0) {
          return `part:${x+1} - `;
        }
      },
      _: function(key){return TAPi18n.__(key)}
    });
    console.log(`etime: ${new Date().getTime()-etime}`);
    res.status(200)
      .end(SSR.render('page-template',{
        html:html
      }));
  })
  .catch(err =>{
    res.status(200).send(`err:${err}`)
  })
};

/*
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
*/

/*******************************
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
*********************/
