import cms from '../xlsx-upload/cms-openacs.js'

export var db;
export var package_id;

Meteor.startup(() => {

//  db = cms.get_connection();
//  console.log('db:',Object.keys(db))
console.log(`Meteor.settings.public:`,Meteor.settings.public)
console.log(`Meteor.settings.private:`,Meteor.settings.private)


  cms.open_cms(Meteor.settings.private)
  .then(ctx =>{
    db = ctx.db;
    package_id = ctx.package_id;
    if (!db) throw 'fatal-32. Unable to open database'
  })
  .catch(err=>{
    cms.close_cms();
    console.log('fatal err:',err)
    throw `Meteor.startup [cms-server.js] fatal-37. err =>"${err.message}"`
  })
});

// ---------------------------------------------------------------------------

export function _assert(b, o, err_message) {
  if (!b) {
    console.log(`######[${err_message}]_ASSERT=>`,o);
    console.trace(`######[${err_message}]_ASSERT`);
    throw {
      message: err_message // {message} to be compatible with other exceptions.
    }
  }
}



// ---------------------------------------------------------------------------

//module.exports = {
//  db, package_id, _assert
//}
