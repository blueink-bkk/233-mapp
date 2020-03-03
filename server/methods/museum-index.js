import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'museum-index': ()=>{
    const etime = new Date().getTime()
    /*
    return db.query (`
      select
        xid,
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
--      order by yp, h1;
      order by xid
    `, {package_id})*/
    return db.query(`
      select xid, filename, lang,
      data->'auteurs' as auteurs,
      data->'co' as co,
      data->'en' as en,
      data->'fr' as fr,
      data->'h1' as h1,
      data->'h2' as h2,
      data->'indexNames' as indexNames,
      data->'links' as links,
      data->'pic' as pic,
      data->'sec' as sec,
      data->'yp' as yp,
      data->'mk' as mk
      from tvec.pagex
      where (path = 'museum.yaml')
      and ((data->>'deleted')::boolean is not true)
      order by xid
      limit 65000;
      `)
    .then(data =>{
      const _etime = new Date().getTime() - etime;
      console.log(`tvec.pagex => ${data.length} in ${_etime} ms.`)
      return Promise.resolve({
        _etime: _etime,
        rows: data
      })
    })
  }
});
