const Massive = require('massive');
const monitor = require('pg-monitor');
const assert = require('assert')


async function mk_index(o) {
  const {verbose=false} = o;
  ;(verbose >0) && console.log(`@60: entering index-constructeurs.`)
  const etime = new Date().getTime();

  let db = o.db || await Massive(o)

  ;(verbose >0) && console.log('Massive is ready.');

  const data = await db.query(`
    select
        data->>'h1' as h1,
       data->'indexNames' as indexnames, -- constructeurs
       data->'links' as links,
       data->>'yp' as yp,
       (data->>'transcription')::boolean as transcription,
       (data->>'restricted')::boolean as restricted,
       data->>'xid' as xid,
--         data->'mk' as mk,
       (data->>'sec')::integer as sec
    from adoc.page, adoc.file
    where (file_id = id) and (path <@ 'museum.md')
    and ((data->>'sec')::integer <3)
    order by data->>'xid'
--      limit 5
    ;
    `,[],{single:false})
  // console.log({data})
  if (!o.db) db.instance.$pool.end();


  /*
      quick check
  */

  for (a of data) {
    if (!a.indexnames || a.indexnames<=0) {
      console.log(`@159 fatal No-constructeurs:`,{a})
      process.exit(-a)
    }

  }

  /*
        Now we can create index
  */
  (verbose >0) && console.log(`@153 data.length:${data.length}`);
  const index = mk_index_constructeurs(data).sort((a,b)=>{
    //console.log({a})
    return a.cName.localeCompare(b.cName);}
  );

  (verbose >0) && console.log(`@155 index.length:${index.length} etime:${new Date().getTime()-etime}`)

  return {index, etime: new Date().getTime()-etime}
}


function mk_index_constructeurs(xlsx) { // 1-1 relation with xlsx
  const _index = {}
  let mCount = 0;
  for (const xe of xlsx) {
    const {xid, yp, h1, indexnames:_vcc, mk, links, transcription, restricted} = xe;
    // each xlsx-entry can generate multiple entry in marques.

    if (!_vcc) {
      console.log(`@328 fatal:`,{xe})
      process.exit(-1)
    }

//    console.log(`@332 fatal:`,{indexnames})

    const vcc = _vcc.map(mk1=>(mk1.trim())).filter(mk1=>(mk1.length>0)); // FIX.

    if (!vcc || (vcc.length<1)) {
      notice(`j:${j} titre:${JSON.stringify(xe)}`);
      mCount++;
      notice (`mapp_index_byMarques =>fatal title without marque xid:${xid} ${mCount}/${j}`);
      continue;
    }
  //  notice(titre.sec);


    vcc.forEach((cc1)=>{
      if (cc1.length<1) throw `fatal-65`;
      if (cc1.trim().length<1) throw `fatal-66`;

      _index[cc1] = _index[cc1] || [];

      _index[cc1].push({ // document
        h1,
  	    xid,
  	    yp,
  	    links, // pdf
  	    transcription,
  	    restricted
  	  })
    });
  }; // loop.


  const mlist = Object.keys(_index).map(mk1 => ({
      cName: mk1 || '*null*',		// marque === iName
  //    nc: marques[mk1].length,
      articles: _index[mk1]	// list of catalogs.
  }));

//  (verbose >0) && console.log(`@301 mk_index_constructeurs: ${mlist.length} constructeurs`)
  return mlist;
}


module.exports = mk_index;
