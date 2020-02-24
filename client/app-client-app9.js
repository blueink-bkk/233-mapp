const assert = require('assert');
const punycode = require('punycode');
const Bloodhound = require('bloodhound-js');
import { ReactiveDict } from 'meteor/reactive-dict';

/*
  article_id : control display, either index or article
  Router sets immediately that value.
  Hoping no article has (item_id === 0)
*/
export const index = new ReactiveArray();
export const subIndex = new ReactiveVar();
export const subIndex_cursor = new ReactiveVar();

export const search_state = new ReactiveDict();
export const state = new ReactiveDict({"show-intro":true});

export const article_id = new ReactiveVar();
export const db_row = new ReactiveVar();
export const bh_ready = new ReactiveVar(null);

export const search_columns = new ReactiveArray();

export const alert = new ReactiveVar();
export const warning = new ReactiveVar();

// --------------------------------------------------------------------------
const nor = (s)=>{
  let hex = punycode.ucs2.decode(s);
//  console.log('fix1.1>', hex.map(it=>it.toString(16)).join('|'));
//  console.log('fix1.2>', [...s].map(it=>it.codePointAt(0).toString(16)).join('|'));

  let hex2 = hex.map(it=>{
    let cc = it;
    switch(cc) {
      case 0x82: cc=0xE9; break;
      case 0x87: cc=0xE7; break;
      case 0x92: cc=lq; break;
    }
    return cc;
  });

//  console.log('5>', punycode.ucs2.encode(hex));
//  console.log('6>', punycode.ucs2.encode(hex2));
  s = punycode.ucs2.encode(hex2)
//      .replace(/ée/g,'é')
      .replace(/eé/g,'é')
      .replace(/cç/g,'ç');

  return s.trim()
    .replace(/  */g,' ')
    .replace(/ \.jpg/g,'.jpg')
    .replace(/ -/g,'-')
    .replace(/- /g,'-')
    .replace(/ \(/g,'(')
    .replace(/\) /g,')')
    ;
}

// ----------------------------------------------------------------

var charMap = {
    "à": "a",
    "â": "a",
    "é": "e",
    "è": "e",
    "ê": "e",
    "ë": "e",
    "ï": "i",
    "î": "i",
    "ô": "o",
    "ö": "o",
    "û": "u",
    "ù": "u"
};

var normalize = function (input) {
  if (input && input.length > 0) {
    $.each(charMap, function (unnormalizedChar, normalizedChar) {
        var regex = new RegExp(unnormalizedChar, 'gi');
        input = input.replace(regex, normalizedChar);
    });
    return input;
  }
}

// --------------------------------------------------------------------------

const mk_ts1 = function(h){
  //console.log('--mk_ts1 h:<%s>',h)
  h = h //.replace(/::fa.*$/,'') // ::fa is full address.
      // .replace(/::/g,' ')
      .toLowerCase()
      .replace(/['\(\)\-\.]/g,' ')
      .replace(/ {2,}/g, ' ');

var uniq = [ ...new Set(h.split(' ')) ];
/*
  uniq.forEach((it)=>{
    it = it.trim();
    if (it.length > 2) it = it.latinize();
    else it = ''; // drop this stop word
  });
  uniq.join(' ').replace(/ {2,}/g, ' ');
*/

let v = uniq.filter((it)=>{
    it = it.trim();
    return (it.length > 2);
  });

//console.log(' -- mk_ts2:(%s)',v.join(' '));
  return v.join(' ');
};


const mk_ts = function(cols) {
  //console.log('mk_ts cols:',cols);
  cols = cols || ['yp','h1','h2','mk2','fr','en'];
  const rows = index.array();
  rows.forEach((it,i)=>{
    let ts = [];
    cols.forEach(k => {
        ts.push(it[k]);
    });

      //.join(' ');
//    console.log('mkts ts:<%s>',normalize(ts.join(' ')));
    it.ts_vector = mk_ts1(normalize(ts.join(' '))); // also remove accents.

    //it.ts_vector = "hello";
  }); // each row.
};

// --------------------------------------------------------------------------

export function load_index(rows) {
  const etime = new Date().getTime();
  index.clear();
  rows.forEach(it =>{
    it.pic = nor(it.pic || '');
    it.reserved = (it.flag && it.flag == 'R'); // RESERVE
    it.mk = it.mk && JSON.parse(it.mk).sort();
//      console.log('it.mk (%d):',it.mk.length,it.mk);
    if(it.mk && (it.mk.length <= 0)) it.mk = null;
    if (it.mk) {
      it.mk2 = it.mk && it.mk.join(' ').toLowerCase();
    }
//    if (it.flag == 'R') {
//      r_counter += 1;
//    } else {
      //it.ts_vector = mk_ts1(it);
      //console.log(' -- ts_vector:',it.ts_vector);
      index.push(it);
//    }
  });
  console.log('load_index %d items took:%d ms.',
      rows.length, new Date().getTime()- etime);
}

// --------------------------------------------------------------------------

const bh_engine = new Bloodhound({ // only used here in index.
      local: [], //[{name:'dog'}, {name:'pig'}, {name:'moose'}],
      init: false,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d.ts_vector); // normalized
      }
    }); // engine


export function bh_init() {
  return bh_engine.initialize()
  .then(function() {
      console.log('> bh-engine (re)init done - adding index length:',index.array().length);
      mk_ts()
        bh_engine.add(index.array());
      //console.log(' -- xowiki BH-engine ready at: ', new Date().getTime());
      //Session.set('bh-engine-ready',new Date().getTime());
    //      Modules.pb.bh_engine = engine;
          // ITS WHERE WE SHOULD SET A REACTIVE VAR ON TEMPLATE INSTANCE.
    bh_ready.set(true)
    return Promise.resolve(true);
  }); // promise
};


// ---------------------------------------------------------------------

export function bh_search(value){
  const searchText = normalize(value.replace(/[,:;\+\(\)\-\.]/g,' '));
  console.log('bh_search(%s)',searchText);

//  Session.set('actual-search-text',_searchText);
  const s_time = new Date().getTime();
//console.log('xowiki bh_search <%s>',s);
//  const engine = Modules.pb.bh_engine;
  if (!bh_engine) {
    console.log('ALERT BH-engine not ready.');
//    Session.set('ui-warning', '45DA12:: BH-engine not ready')
    return Promise.reject('ALERT BH-engine not ready.');
  }


  return new Promise((resolve,reject)=>{
    bh_engine.search(searchText,
    function(d) { // success
      console.log('bh_search => ', d.length);
      subIndex.set(d);
      if (d.length <= 0) {
        console.log('> subIndex is empty');
      }
      resolve(d);
    },
    function(d) { // error
      console.log('ERROR:',d);
      subIndex.set(null);
      reject(d);
    });
  }); // promise
} // bh_search

// -------------------------------------------------------------------

function get_subIndex_cursor(){
  const v = subIndex.get();
  const ai = article_id.get();

  if (!v || v.length <= 0 || !ai) {
    subIndex_cursor.set(undefined)
    return -1;
  }

  let si = subIndex_cursor.get();
  if ((typeof si == 'undefined')||(!v[si])||(v[si].id !== ai)) {
    si = v.findIndex(it=>{return (it.id == ai);})
    if ((si < 0)||(si >= v.length)) {
      subIndex_cursor.set(undefined)
      return -1; // error current is not in subIndex.
    }

    subIndex_cursor.set(si);
  }

  return si;
}

export function next_article(k){
  const v = subIndex.get();
  if (!v || v.length <= 0) {
    return -1;
  }

  let si = get_subIndex_cursor();
  si += k;
  if ((k > 0)&&(si >= v.length)) si = 0;
  else if ((k < 0)&&(si < 0)) si = v.length-1;

  if (!v[si]) {
    console.log('next_article v[%d]:',si,v[si]);
    console.log('-- v.length:%d',v.length)
    return -1;
  }

  subIndex_cursor.set(si);
  const ai = v[si].id;
  return ai;
}; // next-article


// ----------------------------------------------------------------

export function get_itemx(item_id){
  return new Promise((resolve,reject)=>{
    Meteor.call('museum-get-itemx',{item_id:item_id, opCode:'latest'},(err,data)=>{
      if (err) {
        reject (err);
      }

      console.log('museum-get-itemx =>data:',data);
      data.row.content.reserved = (data.row.content.flag == 'R');
      db_row.set(data.row);
      state.set('html',null);
      state.set('meta',data.row.content); // Museum is 100% pure YAML.
      resolve (data.row);
    }) // call
 }); // promise
} // get_itemx


export function show_article(item_id) {
  return get_itemx(item_id)
  .then(()=>{
    if (subIndex.get())
      get_subIndex_cursor(); // to update cursor.
  })
}

// -----------------------------------------------------------------------

const all_columns = [
  {label:'yp', tag:'yp'},
  {label:'h1', tag:'h1'},
  {label:'h2', tag:'h2'},
  {label:'brands', tag:'mk2'}, // string not array
  {label:'fr', tag:'fr'},
  {label:'en', tag:'en'},
  {label:'zh', tag:'zh'},
];

(()=>{
  let col = all_columns.find(it=>(it.tag == 'yp'))
  search_columns.push(col);
  search_columns.push(all_columns.find(it=>(it.tag == 'h1')));
  search_columns.push(all_columns.find(it=>(it.tag == 'h2')));
  search_columns.push(all_columns.find(it=>(it.tag == 'mk2')));
  search_columns.push(all_columns.find(it=>(it.tag == 'fr')));
  search_columns.push(all_columns.find(it=>(it.tag == 'en')));
})();


export function unused_search_columns() {
  let toRemove = search_columns.list();
//    console.log('toRemove:',toRemove);
  const tags_toRemove = toRemove.map((a)=>{return a.tag;});
  const tags_all = all_columns.map((a)=>{return a.tag;});
  const a = [];
  tags_all.forEach( (it,j) => {
    if (!tags_toRemove.includes(it)) {
      a.push(all_columns[j]);
    }
  });
  return a;
}

export function add_search_column(tag) {
  let col = all_columns.find(it=>(it.tag == tag))
  // add to current => reactively it will be removed from ...
  //console.log('_col:',_col);
  search_columns.push(col);
}

export function add_all_search_columns() {
  search_columns.clear();
  all_columns.forEach(it => {search_columns.push(it);})
}

export function remove_search_column(tag) {
/*
  const cols = search_columns.array();
  if (cols.length <= 1) {
    // add before remove nothing to remove
    return -1;
  }
  */
//  const col = cols.filter(it=>(it.tag != tag));

  const i = search_columns.array().findIndex(it=>(it.tag == tag));
  if (i >= 0)
    search_columns.splice(i,1);
  return i; // removed.
}
// ------------------------------------------------------------------------
