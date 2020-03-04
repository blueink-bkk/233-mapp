import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'get-itemx': (cmd)=>{
    const {xid} = cmd;
    _assert(xid, cmd, 'Missing xid');
    /***
    return db.query (`
      select *
      from cms_articles__directory
      where item_id = $1
    ;`, [item_id], {single:true})
    */

    return db.query (`
      select *
      from tvec.pagex
      where (path = 'museum.yaml')
      and (xid = $1)
    ;`, [xid], {single:true})
    .then(retv =>{
//      console.log(`get-itemx =>${retv.length} rows in ${new Date().getTime()-etime} ms.`)
      console.log(`get-itemx => retv:`,retv)
      return retv
    })
    .catch(err=>{
      console.log(`get-item err:`,err)
      return {
        error:err.message
      }
    })
  }
});

/*********************
export function museum_get_itemx(o){
  const etime = new Date().getTime()
  if (o.item_id) {
    if (!(o.opCode && ['live','latest','all'].includes(o.opCode))) {
      o.opCode = 'latest';
    }
    // and always return index for all revisions.
  } else {
    return Promise.reject("museum-get-itemx Missing item_id.");
  }

  if (!o.item_id && !o.revision_id) {
    return Promise.reject('Incorrect request museum-get-item: '+o);
  }

  return db.one (`select * from content_item__getx($(item_id),$(opCode))`,o)
  .then(data =>{
    return Promise.resolve({
      _etime: new Date().getTime() - etime,
      row: data
    })
  }) // then
}
************/
