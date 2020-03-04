import './index-marques.html';
const assert = require('assert')

//import {auteurs, app} from '../app-client.js';
//import {auteurs, auteurs_array} from '../app-client.js';
const TP = Template['index-marques'];

const articles = new ReactiveVar([]);
const index = new ReactiveVar([]);
const index_status = new ReactiveVar();


TP.onCreated(function(){
})

TP.onRendered(function(){

  Meteor.call('list-articles', async (err, data)=>{
    if (err) throw err;
    if (data.error) {
      console.log(`[index-marques] data:`,data);
      index_status.set(data.error)
      return;
    }

    const {data:articles, etime} = data;
    console.log(`@27: call(index-marques) => articles(${articles.length})`)

    const {index:mlist} = mk_index_marques(articles)

    const g = reformat(mlist)
//    const y = await reformat(index)
    const na = g.next()
    console.log(`@84: reformat-1 na:`,na.value)
//    Session.set('wait-message',`got ${retv.index.length} results`)
    g.next()
    console.log(`@84: reformat-2`)
//    Session.set('wait-message',`compiling ${retv.index.length} results`)
    const {value:y, done} = g.next()
//    Session.set('wait-message',`sorting ${retv.index.length} results`)
    console.log(`@84: reformat-3 (done:${done}) y:${y.length}`)
    index.set(y)
//    console.log(y)
//    Session.set('wait-message', null)
//    this.data.q.set('done')
  }) // call
})

TP.helpers({
  wait_message() {
//    return Session.get('wait-message')
  }
})

TP.helpers({
  marques() { // is an array.
    return index.get();
  },
  data_status() {
    return index_status.get();
  }
});

TP.events({
  'click .js-save-selection':(e,tp)=>{
    e.stopImmediatePropagation();
    console.log(`.js-save-selection e:`,e);
    /*
        Collect all checked auteurs.
    */
    const v = tp.findAll('.js-select-auteur')
    .filter(it=>(it.checked)).map(it=>it.value);
    console.log(v)
    Session.set('selected-auteurs',v)
  }
});


TP.events({
  'input .js-select-auteur': (e,tp)=>{
    e.stopImmediatePropagation();
    console.log(`input target (${e.target.name})=>(${e.target.value}) checked:`,e.target.checked);
  },
  'input': (e,tp)=>{
    const value = e.target.value;
    const etime = new Date().getTime();
    console.log(`input2 target (${e.target.name})=>(${e.target.value})`);

    const _value = value.toLowerCase()
    .replace(/\s+/g,'\\s+')
    .replace(/[aàáâä]/g,'[aàáâä]')
    .replace(/[eèéêë]/g,'[eèéêë]')
    .replace(/[iìíîï]/g,'[iìíîï]')
    .replace(/[oòóôö]/g,'[oòóôö]')

    // ------------------------------------------
    if (!value || value.length<=2) { // reset to visible.
      console.log('reset to visible')
      for (j in auteurs) {
        if (auteurs[j].dirty || (auteurs[j].hidden == true)) {
          // restore
          auteurs[j].hidden = false;
//          auteurs[j].display_type = 'table-row';
          const y = Object.assign({},auteurs[j]);
          app.auteurs_array.set(j,y)
          auteurs[j].dirty = false;
        }
      }
      return;
    }
    // ------------------------------------------


    console.log('_value:',_value)
    const re = new RegExp(_value,'i')
    console.log('re:',re)
    for (j in auteurs) {
      const name1 = auteurs[j].name;
//      console.log(name1)

      if (!name1.match(re)) {
//        auteurs[j].hidden = true;
        if (auteurs[j].dirty || (auteurs[j].hidden != true)) {
          // restore
//          auteurs[j].display_type = 'none';
          auteurs[j].hidden = true;
          const y = Object.assign({},auteurs[j]);
          app.auteurs_array.set(j,y)
          auteurs[j].dirty = false;
        }
        continue;
      }


//      const new_name = name1.replace(re,`<b style="color:blue;">${value}</b>`);
      const new_name = name1.replace(re, (x,y,$3,$4)=>{
        console.log(`replace x:(${x}) y:(${y})(${$3})(${$4})`)
        return `<b style="color:blue;">${x}</b>`;
      });

//      console.log(new_name);
      if (new_name == name1) {
        // unchanged from the original
//        auteurs[j].display_type = 'none';
        auteurs[j].hidden = true;
        /*
        if (auteurs[j].dirty) {
          // restore
          const y = Object.assign({},auteurs[j]);
          auteurs_array.set(j,y)
          auteurs[j].dirty = false;
        }
        */
      }
      else {
  //      auteurs[j].hidden = false;
//        auteurs[j].display_type = 'table-row';
        auteurs[j].hidden = false;
        const y = Object.assign({},auteurs[j]);
        y.name = new_name;
        auteurs_array.set(j,y)
        auteurs[j].dirty = true;
      }
    } // loop
    console.log(`etime to update: ${new Date().getTime()-etime}ms.`)
  } // input

})


function *reformat(index) {
  yield index.length;

  const y = index.map(({marque, articles:titres})=>{
    //console.log(`@27: `,marque)
    if (!titres || titres.length <1) {
      titres.push({fn:"TRANSCRIPTIONx"})
      throw 'stop-24'
    } else {
      if (!Array.isArray(titres)) {
        console.log(titres);
        throw 'fatal-29 Not an array.'
      }

      titres.forEach(titre=>{
        titre.links.forEach((pdf)=>{
          pdf.fn2 = pdf.fn
          .replace(/^[0-9\s]*\s*/,'')
          .replace(/[\s\-]*[0-9]+$/,'');
        })
      })

      titres.sort((a,b)=>(a.yp.localeCompare(b.yp)));
    };

    return {
      marque,
      titres
    };
  });

  yield y;

  console.log(`@44: got ${y.length} entries - sorting...`)
  Session.set('wait-message',`almost done`)
  y.sort((a,b)=>{
    //console.log(`--${a.auteurName}`)
    return a.marque.localeCompare(b.marque)
  });
  console.log(`@44: got ${y.length} entries - done`)
  return y;
}


function mk_index_marques(articles) { // 1-1 relation with xlsx
  const marques = {}
  let mCount = 0;
  for (const a1 of articles) {
    const {xid, yp, indexnames:indexNames, mk, links, transcription, restricted} = a1;
    // each xlsx-entry can generate multiple entry in marques.

    if (!indexNames || !mk) {
      console.log(`@328 fatal:`,{xe})
      process.exit(-1)
    }

//    console.log(`@332 fatal:`,{indexnames})

    const _mk = mk.map(mk1=>(mk1.trim())).filter(mk1=>(mk1.length>0)); // FIX.

    if (!mk || (mk.length<1)) {
      notice(`j:${j} titre:${JSON.stringify(indexNames)}`);
      mCount++;
      notice (`mapp_index_byMarques =>fatal title without marque xid:${xid} ${mCount}/${j}`);
      continue;
    }
  //  notice(titre.sec);


    _mk.forEach((mk1)=>{
      if (mk1.length<1) throw `fatal-65`;
      if (mk1.trim().length<1) throw `fatal-66`;
      marques[mk1] = marques[mk1] || [];

      marques[mk1].push({
        title : indexNames[0],
  	    xid,
  	    yp,
  	    links, // pdf
  	    transcription,
  	    restricted
  	  })
    });
  }; // loop.


  const mlist = Object.keys(marques).map(mk1 => ({
      marque: mk1 || '*null*',		// marque === iName
  //    nc: marques[mk1].length,
      articles: marques[mk1]	// list of catalogs.
  }));

  return {index:mlist};
}



// ============================================================================

FlowRouter.route('/index-marques', {
  name: 'index-marques',
    action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-marques');
    }
});
