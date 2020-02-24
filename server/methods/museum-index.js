import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'museum-index': ()=>{
    const etime = new Date().getTime()
    return db.query (`
      select
        data->>'xid' as xid,
        data->>'sec' as sec,
        data->>'h1' as h1,
        data->'h2' as h2,
        data->>'ci' as ci,
        data->>'yp' as yp,
        data->>'pic' as pic,
        data->'mk' as mk,
        data->>'fr' as fr,
        data->>'en' as en,
        data->>'cn' as cn,
        data->>'yc' as yc,
        data->'indexNames' as indexNames,
        data->>'flag' as flag
      from tvec.pages, tvec.files
      where (file_id = id)
      and (path <@ 'museum.yaml'::ltree)
      order by yp, h1;
    `, {package_id})
    .then(data =>{
      const _etime = new Date().getTime() - etime;
      console.log(`tvec.pages => ${data.length} in ${_etime} ms.`)
      return Promise.resolve({
        _etime: _etime,
        rows: data
      })
    })
  }
});
