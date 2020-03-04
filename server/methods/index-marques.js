import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'index-marques': async ()=>{
    _assert(db,db,'fatal Missing db')

    const retv = await require('../lib/index-des-marques.js')({db});
    //console.log(retv)
    const {index,etime} = retv;
    console.log(`@10 list.length:${index.length}`)
    index.forEach(p=>{
//      console.log(p)
    })

    return {index,etime}


    /* return db.query(`
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
    })*/

  }
})
