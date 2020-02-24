import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'index-auteurs': (cmd)=>{
    if (!db) throw 'fatal-@5.'
    if (!package_id) throw 'fatal-@6.'
    return db.query(`
      select * from mapp.index_auteurs($1);
    `,[{package_id}],{single:false})
    .then(retv =>{
      console.log(`[index-auteurs] => ${retv.length} rows`)
      return retv;
    })
    .catch(err=>{
      console.log(`index-auteurs err:`,err)
      return {
        error:err.message
      }
    })
  }
})
