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

  return {index:alist};
}



export default mk_index_auteurs;
