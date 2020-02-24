import { Meteor } from 'meteor/meteor';

import {cms, _assert} from './cms-api.js';

/*
import './methods/index-auteurs.js'         // list auteurs, with articles done on server/plv8
import './methods/index-constructeurs.js'   // list all catalogs, then aggregate on client
import './methods/index-marques.js'         // list marques, with articles done on server/plv8
import './methods/index-s3.js'
import './methods/get-pub-directory.js'
import './methods/upload-file.js'
import './methods/assets-folder-directory.js'
*/


import './methods/get-itemx.js'
import './methods/museum-index.js'
import './methods/pdf-pages-count.js'
import './methods/deep-search.js'
//import './http-server/http-server.js'

Meteor.startup(() => {
//  _assert(!cms.error, cms, 'fatal-@7 error in cms.')
  // console.log(`cms:`,cms)
});
