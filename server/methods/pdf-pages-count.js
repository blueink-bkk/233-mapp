import {db, package_id, _assert } from '../cms-api.js';


Meteor.methods({
  'pdf-pages-count': async ()=>{

    const retv1 = await db.query(`
      select count(*)
      from adoc.pagex
      where path <@ $1
    ;`, ['museum.pdf'], {single:true});

//    console.log(`found ${retv1.count} pages retv1:`,retv1)
//    pdf_pages_count= retv1.count; // set(retv1[0].count)

    const retv2 = await db.query(`
      select count(*)
      from adoc.file
      where path <@ $1;
    ;`, ['museum.pdf'], {single:true});
//    console.log(`found ${retv2.count} pdf/files retv2:`,retv2)

//    console.log(`method pdf-page-count =>${pdf_pages_Count}`)
    const retv = {
      pdf_count: retv2.count,
      pdf_pages_count: retv1.count
    };
    console.log({retv})
    return retv;
  }
});
