const assert = require('assert')
import {app, _assert} from '../app-client.js';
//import {auteurs, auteurs_array} from '../app-client.js';
import './index-s3.html';

const TP = Template['index-s3'];

const articles = new ReactiveVar([]);
const index = new ReactiveVar([]);
const index_status = new ReactiveVar();

TP.onCreated(function(){
})

TP.onRendered(function(){

    Meteor.call('list-articles', (err, data)=>{
      if (err) throw err;
      if (data.error) {
        console.log(`index-s3:`,data);
        index_status.set('error')
        return;
      }

      const {data:articles, etime} = data;
      assert(articles)
      console.log(`index-s3 articles(${articles.length})`)

      index_status.set('reformatting')

      /*
          Here we receive 1 record for each article-catalog.
          Inverted index is done on the client.
          First step, fn2 : file-name cleanup and "transcription".
          then add the acronyms.
      */

  //    data.forEach(a1 =>{ // article
  //    }) // each article

//      console.log(`index-s3 after cleanup ${data.length} rows`)


      console.log(`index-s3 before XIs articles(${articles.length})`)
      const y = XI(articles); // an array with all aternate titles.
      console.log(`index-s3 after XIs ${y.length} rows`)

      index_status.set('almost-done')
      index.set(y)
      index_status.set('done')
  //    console.log(y)
    console.log(`index-s3 building page...`)
    });
})

TP.helpers({
  index() { // is an array.
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

// ===========================================================================

function XI(articles) {
  const xi = []; // NOT a hash - we accept collisions.
  // we add an entry for each titre (and alternate inames).

  let mCount = 0;

  for (const j in articles) {
    const a1 = articles[j];
    const {item_id, xid, yp, name, title ='*missing*', links=[], transcription, restricted, indexnames:indexNames, auteurs=[]} = a1;

    links.forEach((pdf)=>{
      pdf.fn2 = pdf.fn
      .replace(/^[0-9\s]*\s*/,'') // remove 'ca' !!!!
      .replace(/[\s\-]*[0-9]+$/,'');
    })

    /********** validate-fix indexNames
    const indexNames = inames.map(ti=>(ti.trim())).filter(ti=>(ti.length>0)); // FIX.
    if (indexNames.length <1) {
      notice(`j:${j} titre:${JSON.stringify(article)}`);
      mCount++;
      notice (`index-s3 =>fatal article without titre xid:${xid} ${mCount}/${j}`);
      if (false) {
        continue;
      }
    }*/

// console.log(`@196: indexNames:`,indexNames)
    assert(indexNames, a1, 'fatal-183. Missing indexNames')
    //notice(JSON.stringify(titre.aka));

    /*
        if titre is not the first one, create originalName.
    */

    /*
    if (inames.length>1) {
      console.log(`inames:`,inames);
    }*/

    indexNames.forEach((iName, jj)=>{
      xi.push ({
//  	    item_id,
        iName,
        titre_origine: indexNames[0],
        xid,
        yp,
//        name,
        links,
        auteurs,
        transcription,
        restricted
      });
    }); // each titre
  }; // each article.

  /*
  const colist = Object.keys(xi).map(name => ({
      name,			// constructeur-name
      articles: xi[name].cats		// list of catalogs.
  }));
  */
  //return xi; // we might need that hash-table, instead of an array.

  xi.sort((a,b)=>{
    //console.log(`--${a.auteurName}`)
    return a.iName.localeCompare(b.iName)
  });

console.log('EXit XI:',xi)
  return xi; // an array
}

// ============================================================================

FlowRouter.route('/index-s3', { //name: 'auteurs_directory',
    action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-s3');
    }
});
