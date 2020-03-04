const assert = require('assert')
import './index-constructeurs.html';

import {constructeurs, app} from '../app-client.js';
//import {auteurs, auteurs_array} from '../app-client.js';
const TP = Template['index-constructeurs'];

const index = new ReactiveVar([]);
const status = new ReactiveVar('initial-state');
const index_status = new ReactiveVar('initial-state');

TP.onCreated(function(){
})

TP.onRendered(function(){

  index_status.set('calling index-constructeurs')

  // we should get both : list articles and index-constructeurs

  Meteor.call('list-articles',(err, retv)=>{
    if (err) throw err;
    if (retv.error) {
      console.log(`ALERT index-constructeurs:`,retv);
      index_status.set(retv.error)
      return;
    }

    const {data:articles,etime} = retv;
    assert(articles)
    index_status.set('reformatting')
//    console.log(`index-constructeurs receiving index:`,index)
    console.log(`index-constructeurs articles (${articles.length})`)
    /*
        Here we receive 1 record for each article-catalog.
        Inverted index is done on the client.
        First step, fn2 : file-name cleanup and "transcription".
        then add the acronyms.
    */

    // some pre-processing...
    articles.forEach((a1,j) =>{ // Catalogs ( from Construteurs)
      if (!a1.indexnames) {fatal$42(a1, 'missing indexNames');}
//      a1.indexNames = a1.indexNames.map(ti=>(ti.trim())).filter(ti=>(ti.length>0)); // FIX.
      if (!a1.links || a1.links.length<1) {
//        a1.links.push({fn2:"TRANSCRIPTION"})
      } else {
        // tp.data_status.set(`reformatting ${j}`); // does nothing.!!!
        a1.links.forEach((pdf)=>{
          pdf.fn2 = pdf.fn
          .replace(/^[0-9\s]*\s*/,'') // remove 'ca' !!!!
          .replace(/[\s\-]*[0-9]+$/,'');
        })
      }
    }) // each cc.

    const xi = XI(articles); // list (Array) of constructeurs, with catalogs.
    index.set(xi)
//    console.log(xi)
    index_status.set('ready')
  });
})

function fatal$42(a1, msg) {
  console.log(`\n>>>>>>>fatal$42 : `,msg)
  console.log(a1)
  throw msg
}


TP.helpers({
  constructeurs() { // is an array.
    return index.get();
  },
  index_status() {
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

// ===========================================================================

/*

        xi: a list of constructeurs.
        For each constructeur, all articles/catalogs ordered by yp.

*/

function XI(articles) {
  const xi = {} // Inverted Index -- for constructor legalName (indexName) and all acronyms => list of catalogs.
  let mCount = 0;

  for (const j in articles) {
    const article = articles[j];
    const {item_id, xid, yp, name, title, links, transcription, restricted, indexnames:indexNames} = article;

    _assert((indexNames && indexNames.length>0), article, 'fatal-195. missing indexNames');

    indexNames.forEach((cname, ia)=>{
      if (cname.length<1) throw `fatal-65`;
      if (cname.trim().length<1) throw `fatal-66`;
      xi[cname] = xi[cname] || {
        indexName: cname, // constructeur
        voir_legalName: ((cname != indexNames[0])? indexNames[0] : null),
        articles:[]
      }
      xi[cname].articles.push({
//  	    item_id, should be revision
        title,    // first of indexNames for article.title
        xid,      // debug
        yp,
        name,
        links,
        transcription,
        restricted
      })
    }); // each aka
  }; // each article.

  /*
  const colist = Object.keys(xi).map(name => ({
      name,			// constructeur-name
      articles: xi[name].cats		// list of catalogs.
  }));
  */
//  return xi; // we might need that hash-table, instead of an array.

  /*
  const y = Object.values(xi).map(ccName => ({
      ccName,			// constructeur-name
      legalName: xi[ccName].legalName,
      aka: xi[ccName].aka,
      articles: xi[ccName].cats		// list of catalogs.
  }));
  */

  return Object.values(xi)
  .sort((a,b)=>{
    return a.indexName.localeCompare(b.indexName)
  });


}

// ---------------------------------------------------------------------------

function _assert(b, o, err_message) {
  if (!b) {
    console.log(`######[${err_message}]_ASSERT=>`,o);
    console.trace(`######[${err_message}]_ASSERT`);
    throw err_message
  }
}

// ============================================================================

FlowRouter.route('/index-constructeurs', {
  name: 'index-constructeurs',
    action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-constructeurs');
    }
});
