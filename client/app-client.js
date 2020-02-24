const assert = require('assert');
//const path = require('path');
import path from 'path-browserify';
const { parse } = path

console.log('path:',path)

import { ReactiveDict } from 'meteor/reactive-dict';
const Bloodhound = require('bloodhound-js');

// import dkz from '/imports/dkz-lib.js'

//export const index = new ReactiveArray();
//export const subIndex = new ReactiveVar();
//export const subIndex_cursor = new ReactiveVar();

export const auteurs = {};
export const auteurs_array = new ReactiveArray(); // should we keep only the columns displayed.
export const titles = {};
export const titles_array = new ReactiveArray(); // should we keep only the columns displayed.
export const constructeurs = {};
export const publishers_array = new ReactiveArray(); // should we keep only the columns displayed.
export const state = new ReactiveDict({"show-intro":true});

export const app = {
  state: new ReactiveDict(),
  index: [],
  subIndex: new ReactiveVar(),
  search_params: new ReactiveDict(),
  article: new ReactiveVar()
};

app.state.set('show-intro',true);
app.state.set('subIndex-cursor',0); // does-it need to be reactive ?
app.state.set('pub-counter',0);
app.state.set('pdf-pages-count',0); // replace data_ready in /deep-search

// ---------------------------------------------------------------------------

/*

    This technique might not be the best.
    In case of error, we need to raise a flag,
    and the client must react accordingly => another reactive-var.
    Instead if we use Meteor.call, we can process the errors immediately.

*/

Tracker.autorun((x)=>{
  const item_id = app.state.get('article-id')
  if (!item_id) return;
})

// ---------------------------------------------------------------------------

export function auteur_lookup(uname) {
  // should lowerCase and remove accents. NORMALIZE.
  console.log(`app.auteur_lookup(${uname}) =>`, auteurs[uname])
  return auteurs[uname];
}
export function titre_lookup(uname) {
  console.log(`app.titre_lookup(${uname})`)
}
export function soc_lookup(uname) {
  console.log(`app.soc_lookup(${uname})`)
}


export function _assert(b, o, err_message) {
  if (!b) {
    console.log(`######[${err_message}]_ASSERT=>`,o);
    console.trace(`######[${err_message}]_ASSERT`);
    throw {
      message: err_message // {message} to be compatible with other exceptions.
    }
  }
}


Meteor.startup(() => {
return;
  console.log(`This is startup dans app-client`);
  console.log('startup getting auteurs...');
  const etime = new Date().getTime();

  Meteor.call('cms-auteurs-directory', (err,data)=>{
    if (err) {
      console.log('err:',err)
      throw 'fatal-38'
    }

    console.log(`found ${data.length} auteurs`)
    data.forEach(au=>{
      auteurs[au.name] = au; // name is unique.
    });

    /*
    data.forEach(it=>{
      const au = {
        item_id:it.item_id,
        name:it.name,
        latest_revision:it.latest_revision,
        live_revision: it.live_revisions,
        latest_auteur:it.latest_auteur,
        live_auteur: it.live_auteur
      }
      auteurs[au.name] = au; // name is unique.
    })
    */

    const v = Object.values(auteurs);
    v.forEach(au => {au.localeName = RemoveAccents(au.name).toLowerCase();})

  //  .sort((a,b)=>(a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'})))
    v.sort((a,b)=>(a.localeName.localeCompare(b.localeName, 'fr', {sensitivity: 'base'})))
    console.log(`startup etime:${new Date().getTime()-etime}ms. for ${v.length} auteurs`)
    auteurs_array.push(...v);
  });
});

// ----------------------------------------------------------------------------

function RemoveAccents(strAccents) {
 var strAccents = strAccents.split('');
 var strAccentsOut = new Array();
 var strAccentsLen = strAccents.length;
 var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
 var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
 for (var y = 0; y < strAccentsLen; y++) {
   if (accents.indexOf(strAccents[y]) != -1) {
     strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
   } else
     strAccentsOut[y] = strAccents[y];
 }
 strAccentsOut = strAccentsOut.join('');
 return strAccentsOut;
}

// ============================================================================

export function insert_new_auteur(it) {
  if(!it.name) {
    console.log('insert_new_auteur it:',it);
    throw 'fatal-78';
  }
  const au = {
    item_id:it.item_id,
    name:it.name, // unique & normalized
    title:it.title,
    latest_revision:it.latest_revision,
    live_revision: it.live_revisions,
    latest_auteur:it.latest_auteur,
    live_auteur: it.live_auteur,
    localeName: RemoveAccents(it.name).toLowerCase()
  }
  auteurs_array.push(au);
}

// ============================================================================

export function new_titre(o) {
  return new Promise((resolve,reject)=>{
    Meteor.call('new-titre',o,(err, retv)=>{
      if (err) {
          console.log(`new-titre err:`,err)
          // do something on UI
          reject(err)
          return;
      }

      console.log(`new-titre retv:`,retv)

      if (retv.err) {
          console.log(`new-titre ERROR retv:`,retv.err)
          reject(err)
          return; // warning in UI.
      }

      /*
          Update local-store with new title.
          both: titles and titles_array
      */

      titles[retv.item_id] = retv;

      titles_array.push({
        item_id:retv.item_id,
        name:retv.name, // unique & normalized
        title:retv.title,
        latest_revision:retv.latest_revision,
        live_revision: retv.live_revisions,
        latest_auteur:retv.latest_auteur,
        live_auteur: retv.live_auteur,
        localeName: RemoveAccents(retv.name).toLowerCase()
      });
      resolve(retv)
    }); // meteor.call
  })
}

// ============================================================================

export function update_article(o) {

  // validate data before sending to the server.
  assert(o, `Missing o`)
  assert(o.item_id, `fatal-143`)
  assert(o.name, `fatal-144`)
  assert(!o.data.name, 'fatal-145 data.name is Obsolete')
  if (o.title != o.data.title) {
    console.log('SYSTEM ALAERT title != data.title');
    o.title = o.data.title
  }
//  assert(o.name == o.data.name, `fatal-145`)
//  assert(o.title, `fatal-146`)

  return new Promise((resolve,reject)=>{
    Meteor.call('update-article',o,(err, retv)=>{
      if (err) {
          console.log(`new-titre err:`,err)
          // do something on UI
          reject(err)
          return;
      }

      console.log(`update_article retv:`,retv)

      if (retv.err) {
          console.log(`new-titre ERROR retv:`,retv.err)
          reject(err)
          return; // warning in UI.
      }

      /*
          Update local-store with new title.
          both: titles and titles_array
      */

      /*
      titles[retv.item_id] = retv;

      titles_array.push({
        item_id:retv.item_id,
        name:retv.name, // unique & normalized
        title:retv.title,
        latest_revision:retv.latest_revision,
        live_revision: retv.live_revisions,
        latest_auteur:retv.latest_auteur,
        live_auteur: retv.live_auteur,
        localeName: RemoveAccents(retv.name).toLowerCase()
      });
      **/
      resolve(retv)
    }); // meteor.call
  }) // promise
} // update article(o)


// ============================================================================

export function insert_new_publisher(o) {
  // validate-first
  return new Promise((resolve,reject)=>{
    Meteor.call('insert-new-publisher',o,(err, retv)=>{
      if(err) {
        reject(err);
      }

        /*
            Update local-store with new auteur. TODO.
        */

      resolve(retv);
    }); // call
  }); // promise
} // insert-new-publisher


// ============================================================================

export function find_publisher_byName(name) {
  assert(name, `Missing name.`)
  return new Promise((resolve,reject)=>{
    Meteor.call('publisher-infos',{
      name,
      checksum: "", // to be used if we have local copy
    },(err, retv)=>{
      console.log(err,retv)
      if (err) reject(err);
      resolve(retv);
    })
  }) // promise
}

// ============================================================================

/*
          Update title is common to all cr_items/cr_revisions
          WRONGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG

*/

export function update_title(parent, {title,name}) {
  assert(title, `Missing title.`)
  assert(name, `Missing name.`)
  // console.log(`update_title parent:`,parent);

  return new Promise((resolve,reject) =>{
    Meteor.call('update-title',{
      item_id: parent.item_id,
      name
//      name,
//      checksum: "", // to be used if we have local copy
    },(err, retv)=>{
      console.log(err,retv)
      if (err) reject(err);
      resolve(retv);
    })
  }) // promise
}


// ============================================================================

export function publisher__new_revision(o) {

  const missing = dkz.check_missing(o, 'item_id,title,name')
  if (missing) {
    console.log('publisher__new_revision:',o)
    throw `fatal-266 missing: [${missing.join(',')}]`;
  }

  /*
        if we change the title, chances are we are proposing a new name.
        We need access using item_id.
  */

  return new Promise((resolve,reject) =>{
    Meteor.call('publisher::new-revision', o, (err, retv)=>{
      console.log(err,retv)
      if (err) {
        reject(err);
        return;
      }
      /*
          update localSore.
          In a perfect world, we should get updated object back from DB.
          Here, we use o to update publishers[]
      */
//      console.log('retv:',retv);
//      console.log('retv.new_revision_id:',retv.new_revision_id);
      _assert (retv.revision_id, retv, `fatal-279 retv.new_revision_id:${retv.new_revision_id}`)

      console.log(`publisher sent o:`,o)

      const p = constructeurs[o.item_id];
      if (!p) {
        throw `ALERT unable to get publishers[${o.item_id}]`;
      }

      console.log(`original publishers[${o.item_id}]:`,constructeurs[o.item_id])

      const {item_id, name, title} = o;
//      p = dkz.pick(o, 'item_id, name, title')
      Object.assign(p,{item_id, name, title});
      /*
            Need to recalculate localeTitle.
            and set revision_id
            Do we need to sort ?
      */

      p.revision_id = retv.new_revision_id;
      p.localeTitle = dkz.RemoveAccents(p.title).toLowerCase();
      /*
          Since the title changed, we must re-order the list.
      */

      /** jagi DOES NOT HAVE SORT ............................
      publishers_array.sort((a,b)=>{
        return a.localeTitle.localeCompare(b.localTitle, 'fr', {sensitivity: 'base'});
      })**/


      resolve(retv); // not really useful, except resolve.
    })
  }) // promise
}

// ---------------------------------------------------------------------------

export function update_subIndex_cursor(){
  const v = app.subIndex.get();
  const ai = app.state.get('article-id');

  if (!v || v.length <= 0 || !ai) {
    app.state.set('subIndex-cursor',undefined);
    return -1;
  }

  let si = app.state.get('subIndex-cursor');
  if ((typeof si == 'undefined')||(!v[si])||(v[si].xid !== ai)) {
    si = v.findIndex(it=>{return (it.xid == ai);})
    if ((si < 0)||(si >= v.length)) {
      app.state.set('subIndex-cursor',undefined);
      return -1; // error current is not in subIndex.
    }

    app.state.set('subIndex-cursor',si+1);
  }

  return si;
}

// ---------------------------------------------------------------------------

export function next_article(k){
  const v = app.subIndex.get();
  if (!v || v.length <= 0) {
    return -1;
  }

  let si = update_subIndex_cursor();
  console.log(`@423 v[${si}]:${v[si]}`)
  si += k;
  if ((k > 0)&&(si >= v.length)) si = 0;
  else if ((k < 0)&&(si < 0)) si = v.length-1;

  if (!v[si]) {
    console.log('next_article v[%d]:',si,v[si]);
    console.log('-- v.length:%d',v.length)
    return -1;
  }

  app.state.set('subIndex-cursor',si+1);
  const ai = v[si].xid;
  console.log(`@435 v[${si}]:${v[si]}`)
  return ai;
}; // next-article


// ============================================================================

/*

    Should prevent creating very close names (ponct-case-etc)

    => searching for "Ateliers de construction (SA)"

*/

export function normal_title(s) {
  // strip accents.
  const v = s && s.toLowerCase()
  .replace(/[^a-z]/g,' ')
  .replace(/\s+/g,'-')
  .split('-')
  .filter(it=>(it.length>2));

  if (v.length>0) return v.join('-');
  return '*undefined*'
}

`
Ateliers de Construction Electriques de Charleroi
ateliers de Construction Electriques de Charleroi SA.
`.split('\n').forEach(it=>{
  console.log(`(${it})=>(${normal_title(it)})`)
})


export const utils = {
  normal_title
}

// =====================================================================

String.prototype.RemoveAccents = function () {
//  var strAccents = strAccents.split('');
 var strAccents = this.split('');
 var strAccentsOut = new Array();
 var strAccentsLen = strAccents.length;
 var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
 var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
 for (var y = 0; y < strAccentsLen; y++) {
   if (accents.indexOf(strAccents[y]) != -1) {
     strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
   } else
     strAccentsOut[y] = strAccents[y];
 }
 strAccentsOut = strAccentsOut.join('');
 return strAccentsOut;
}

/*
      nor_fn1 : toLowerCase - remove accents, replace spaces,dots,non-az by '-'
*/

export function nor_fn1(s) {
  const {dir, name, ext} = path.parse(s)
  const v = name && (''+name).toLowerCase()
  .RemoveAccents()
//  .replace(/20[0-9]{6}/,' ') // remove revision date NO ! max.
  .replace(/[,;:\[\]\&\(\)\-\.\']/g,'-')
//  .replace(/[^a-z]/g,' ')
  .replace(/\s+/g,'-') // insenstive to spaces, dots, dashes and ().
  .replace(/-+/g,'-') // insenstive to spaces, dots, dashes and ().
  return path.join(dir,v+ext);
}

export function nor_fn(s) {
  const charCodeZero = "0".charCodeAt(0);
  const charCodeNine = "9".charCodeAt(0);
  function isDigitCode(n) {
     return(n.charCodeAt(0) >= charCodeZero && n.charCodeAt(0) <= charCodeNine);
  }
  // strip accents.
  const tail = [];
  const h = {};
  const v = s && (''+s).toLowerCase()
  .RemoveAccents()
//  .replace(/20[0-9]{6}/,' ') // remove revision date NO ! max.
  .replace(/[\(\)\-\.\']/g,' ')
//  .replace(/[^a-z]/g,' ')
  .replace(/\s+/g,'') // insenstive to spaces, dots, dashes and ().
  .split('')
  .forEach(cc=>{
    if (isDigitCode(cc)) {
      tail.push(cc)
    } else {
      h[cc] = h[cc] || 0;
      h[cc] ++;
    }
  })

  const s2 = Object.keys(h).map(cc=>{
    return (h[cc]>1)?`${cc}${h[cc]}`:cc;
  })

  const s3 = s2.join('')+tail.join('');
//  console.log(`nor_fn(${s})=>(${s3})`)
  return s3
}


// =====================================================================
/**************
export const app = {
  auteurs,
  auteurs_array,
  insert_new_auteur,
  new_titre,
  update_article,
  insert_new_publisher,
  find_publisher_byName,
  update_title,
  publisher__new_revision
};
***************/
