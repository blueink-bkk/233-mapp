import { Meteor } from 'meteor/meteor';
const yaml = require('js-yaml');
const fs = require('fs');
const massive = require('massive');
const monitor = require('pg-monitor');
const hash = require('object-hash');

//export const cms = {};
export var db;
export var package_id;
export var app_folder_id;

Meteor.startup(() => {
  // code to run on server at startup
  console.log(`cms-api.js::Meteor.startup.`)
  //console.log(`Environment variables: `, process.env)
  //console.log(`Meteor.settings:`,Meteor.settings)
  //cms.status = 'opening';

  const cmd = Object.assign(Meteor.settings,{verbose:0});
  cmd.password = cmd.password || process.env.PGPASSWORD;
  if (!cmd.password) throw 'fatal_@22 Missing password';
  open_cms(cmd)
  .then(retv =>{
//    console.log('open-cms => status:',retv.status)
//    Object.assign(cms,retv);
    //console.log(`open-cms app_folder:`,cms.app_folder)
    console.log(`Leaving Meteor.startup with:
      db: ${!!db}
      package_id: ${package_id}
      `)
  })
  .catch(err => {
    console.log(`FATAL-ERROR trying to open-cms
      `,err)
    console.log(cmd);
  })
});


// ----------------------------------------------------------------------------

async function open_cms(cmd) {
  console.log(`@44: open_cms `,cmd)

  if (!cmd.password) throw 'fatal-@37 Missing password'
  db = await massive(cmd);
  if (cmd.pg_monitor) {
    monitor.attach(db.driverConfig);
    console.log(`pg-monitor attached-Ok.`);
  }
  cmd.db = db;
  return 'ok';
}

// ----------------------------------------------------------------------------

async function authors_directory() {
  _assert(db, db, 'fatal-@71');
  _assert(package_id,package_id,'fatal-@79')
  const directory = await db.query(`
    select * from cms_authors__directory a
    where package_id = $1
  `,[package_id], {single:false}
  );
  console.log(`authors_directory length:`, directory.length)
}

// ----------------------------------------------------------------------------

export function _assert(b, o, err_message) {
  if (!b) {
    console.log(`######[${err_message}]_ASSERT=>`,o);
    console.trace(`######[${err_message}]_ASSERT`);
    throw {
      message: err_message // {message} to be compatible with other exceptions.
    }
  }
}

/*
exports = {
//  db,
  package_id,
//  app_folder,
  app_folder_id,
  _assert
}
*/


export async function search_pages_rank_cd2() {
//  return await db.tvec.search_pages_rank_cd2(vpath,query)
  return await db.adoc.search_pages_rank_cd2(vpath,query)
}
