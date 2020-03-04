import {db, package_id, _assert } from '../cms-api.js';

Meteor.methods({
  'index-auteurs': async (cmd)=>{
    if (!db) throw 'fatal-@5.'
    Object.assign(db, {verbose:1})
    const retv = await require('../lib/index-des-auteurs.js')({db})
    const {index,etime} = retv;
    console.log(`@8: index-auteurs (${index.length})`)
    return {index,etime};
  } // index-auteurs
})
