const assert = require('assert')

import { Meteor } from 'meteor/meteor';

import {db, cms, _assert} from './cms-api.js';

/*
import './methods/index-s3.js'
import './methods/get-pub-directory.js'
import './methods/upload-file.js'
import './methods/assets-folder-directory.js'
*/

Meteor.methods({
  'list-articles': async (cmd)=>{
    if (!db) throw 'fatal-@5.'
    Object.assign(db, {verbose:1})
    const retv = await require('./lib/list-articles.js')({db})
    const {data, etime} = retv;
    assert(data)
    console.log(`@8: list (${data.length})`)
    return {data,etime};
  } // articles
})

Meteor.methods({
  'list-catalogs': async (cmd)=>{
    if (!db) throw 'fatal-@5.'
    Object.assign(db, {verbose:1})
    const retv = await require('./lib/list-catalogs.js')({db})
    const {data, etime} = retv;
    assert(data)
    console.log(`@8: list (${data.length})`)
    return {data,etime};
  } // articles
})


import './methods/get-itemx.js'
import './methods/museum-index.js'
import './methods/pdf-pages-count.js'
import './methods/deep-search.js'
import './methods/index-marques.js'         // list marques, with articles done on server/plv8
import './methods/index-auteurs.js'         // list auteurs, with articles done on server/plv8
//import './methods/index-constructeurs.js'   // list all catalogs, then aggregate on client

import './http-server/http-server.js'

Meteor.startup(() => {
//  _assert(!cms.error, cms, 'fatal-@7 error in cms.')
  // console.log(`cms:`,cms)
});
