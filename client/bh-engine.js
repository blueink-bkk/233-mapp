const Bloodhound = require('bloodhound-js');

const bh_engine = new Bloodhound({ // only used here in index.
    local: [], //[{name:'dog'}, {name:'pig'}, {name:'moose'}],
    init: false,
    identify: function(obj) {
//      console.log(`@7 identify obj.id:`,obj.id)
      if (!obj.xid) throw 'bh-engine-xid'
//      console.log(`@9 identify obj:`,obj)
      return obj.xid;
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: function(o) {
      /*
      console.log(`@ bh-engine.js:9 o.ts_vector:`,o.ts_vector)
      if (!o.ts_vector) {
        console.log(`@11 in bh-engine.js`,{o})
        throw 'fatal'
      } */
      return Bloodhound.tokenizers.whitespace(o.ts_vector); // normalized
    }
}); // engine

export async function bh_init(rows) {
  mk_ts(rows)
  if (!rows[0].ts_vector) throw 'fata;-@14 Missing ts-vector'
  const etime = new Date().getTime();
  const p1 = await bh_engine.initialize()
  console.log(`bh_engine initialized in ${new Date().getTime() - etime} ms.`)
  console.log('bh-init p1:',p1)
  bh_engine.add(rows); // not a promise.
  console.log(`bh_engine - ${rows.length} rows added in ${new Date().getTime() - etime} ms.`)
  console.log('rows:',rows)
};

/*
    normaliser 1 colonne.
*/

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

const mk_ts1 = function(h){
  //console.log('--mk_ts1 h:<%s>',h)
  h = h //.replace(/::fa.*$/,'') // ::fa is full address.
      // .replace(/::/g,' ')
      .toLowerCase()
      .replace(/['’,\(\)\-\.]/g,' ')
      .replace(/ {2,}/g, ' ');

  var uniq = [ ...new Set(h.split(' ')) ];
  let v = uniq.filter((it)=>{
    it = it.trim();
    return (it.length > 2);
  });

//console.log(' -- mk_ts2:(%s)',v.join(' '));
  return v.join(' ');
};

export function mk_ts(rows, cols) {
  console.log(`mk_ts ${rows.length} rows cols:`,cols);
  cols = cols || ['yp','h1','h2','mk2','fr','en'];
  rows.forEach((row,i)=>{
    let ts = [];
    cols.forEach(col => {
      if (Array.isArray(row[col])) {
        row[col].forEach(it =>{
          ts.push(it); // h2, mk, indexNames
        })
      } else {
        ts.push(row[col]); // row['yp'], row['h1'], etc...
      }
    });

    row.ts_vector = mk_ts1(normalize(ts.join(' '))); // also remove accents.
  }); // each row.
};

// --------------------------------------------------------------------------

export function bh_search(value){
  const etime = new Date().getTime();
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

  let results;
  bh_engine.search(searchText,(retv)=>{
    console.log(`bh_search => ${retv.length} in ${new Date().getTime()-etime} ms.  retv:`, retv);
    results = retv;
  });
return results;

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
