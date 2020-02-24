import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'index-marques': ()=>{
    _assert(package_id,package_id,'fatal Missing package_id')
    _assert(db,db,'fatal Missing db')

    return db.query(`
      select * from mapp.index_marques($1::jsonb);
      `,[{package_id}],{single:false})
    .then(retv =>{
      // console.log('mapp.index_marques() =>retv.length',retv.length); throw {message:'stop-406.'};
  //      console.log(`-- etime:${retv.etime} msec.`)
      return retv;
    })
    .catch(err=>{
      console.log(`index-marques err:`,err)
      return {
        error:err.message
      }
    })
  }
})
