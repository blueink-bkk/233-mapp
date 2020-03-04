const Massive = require('massive');
const monitor = require('pg-monitor');
const assert = require('assert')



module.exports = async function list_articles(o) {
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
       (data->>'sec')::integer as sec
    from tvec.pages, tvec.files
    where (file_id = id) and (path <@ 'museum.yaml')
    and ((data->>'sec')::integer < 3)
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
