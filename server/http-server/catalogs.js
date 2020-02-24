
import {cms, db, package_id, _assert} from '../cms-api.js';
const assert = require('assert');
const fs = require('fs');


module.exports = function(req,res) {
  const etime = new Date().getTime();

  _assert(db,db,'Missing db')
  _assert(package_id,package_id,'Missing package_id')

  return db.query(`
    select title, item_id,
      data->>'yp' as yp,
      data->'h2' as h2
    from cms_articles__directory
    where package_id = $1
    order by yp, title
    ;`,[package_id],{single:false})
  .then( articles =>{
    console.log(`found ${articles.length} articles`)
    const html = SSR.render('catalogs',{articles});
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
