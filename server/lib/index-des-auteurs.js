const Massive = require('massive');
const monitor = require('pg-monitor');
const assert = require('assert')


function mk_index_auteurs(xlsx) { // 1-1 relation with xlsx
  const _au = {}
  let mCount = 0;
  for (const xe of xlsx) {
    const {xid, yp, indexnames:indexNames, auteurs, links, transcription, restricted} = xe;
    // each xlsx-entry can generate multiple entry in marques.

    if (!indexNames || !auteurs) {
      console.log(`@328 fatal:`,{xe})
      process.exit(-1)
    }

//    console.log(`@332 fatal:`,{indexnames})

    const _auteurs = auteurs.map(j=>(j.trim())).filter(j=>(j.length>0)); // FIX.

    if (!_auteurs || (_auteurs.length<1)) {
      notice(`j:${j} titre:${JSON.stringify(indexNames)}`);
      mCount++;
      notice (`mapp_index_byMarques =>fatal title without marque xid:${xid} ${mCount}/${j}`);
      continue;
    }
  //  notice(titre.sec);


    _auteurs.forEach((au1)=>{
      if (au1.length<1) throw `fatal-65`;
      if (au1.trim().length<1) throw `fatal-66`;
      _au[au1] = _au[au1] || [];

      _au[au1].push({
        title : indexNames[0],
  	    xid,
  	    yp,
  	    links, // pdf
  	    transcription,
  	    restricted
  	  })
    });
  }; // loop.


  const alist = Object.keys(_au).map(au1 => ({
      auteur: au1 || '*null*',		// marque === iName
  //    nc: marques[mk1].length,
      articles: _au[au1]	// list of catalogs.
  }));

  return alist;
}


async function main(o) {
  const {verbose=false} = o;
  ;(verbose >0) && console.log(`@60: entering index-auteurs.`)
  const etime = new Date().getTime();

  let db = o.db || await Massive(o)

  ;(verbose >0) && console.log('Massive is ready.');

  const data = await db.query(`
      select
         data->'indexNames' as indexnames,
         data->'links' as links,
         data->>'yp' as yp,
         (data->>'transcription')::boolean as transcription,
         (data->>'restricted')::boolean as restricted,
         data->>'xid' as xid,
         data->'auteurs' as auteurs,
         (data->>'sec')::integer as sec
      from tvec.pages, tvec.files
      where (file_id = id) and (path <@ 'museum.yaml')
      and ((data->>'sec')::integer >= 3)
      and (data->>'auteurs' is not null)
      order by data->>'yp'
      ;
      `,[],{single:false})
    // console.log({data})

    if (!o.db) db.instance.$pool.end();


    /*
        quick check
    */

    for (a of data) {
      if (!a.indexnames || a.indexnames<=0) {
        console.log(`@159 fatal indexNames:`,{a})
        process.exit(-a)
      }

    }

    /*
          Now we can create index
    */

    ;(verbose >0) && console.log(`@103: index (${index.length})`)

    const index = mk_index_auteurs(data).sort((a,b)=>{
      //console.log({a})
      return a.auteur.localeCompare(b.auteur);}
    );

    ;(verbose >0) && console.log(`@107: index (${index.length})`)
    return {index};
}


module.exports = main;
