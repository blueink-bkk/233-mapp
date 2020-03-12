const Massive = require('massive');
const monitor = require('pg-monitor');
const assert = require('assert')



module.exports = async function list_catalogs(o) {
  const {verbose=false} = o;
  const etime = new Date().getTime();
  let db = o.db || await Massive(o)
  // if db already open - do not close....

  const data = await db.query(`
    select
       data->'indexNames' as indexNames,
       data->'links' as links,
       data->>'yp' as yp,
       (data->>'transcription')::boolean as transcription,
       (data->>'restricted')::boolean as restricted,
       data->>'xid' as xid,
       data->'mk' as mk,
       data->'auteurs' as auteurs,
       (data->>'sec')::integer as sec
    from adoc.page, adoc.file
    where (file_id = id) and (path <@ 'museum.md')
    and ((data->>'sec')::integer > 2)
    and (data->>'mk' is not null)
    order by data->>'yp'
    ;
    `,[],{single:false})
  // console.log({data})
  if (!o.db) db.instance.$pool.end();

  // now we can process the data.



  return {data,
    etime: new Date().getTime() - etime
  }
}
