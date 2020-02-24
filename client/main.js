import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import './main-trigger.js';
// import './app-bh-test.js';

import './global-helpers.js';
import './app-helpers.js';

import './sitemap-short.html';
import './sitemap-short.js';
import './sitemap-line.html';
import './href-pdf.html';

import './welcome/welcome.html';
import './welcome/welcome.js';

import './quick-search/quick-search.html';
import './quick-search/quick-search.js';

import './deep-search/deep-search.html';
import './deep-search/deep-search.js';


/*************************************


import './index-auteurs/index-auteurs.html';
import './index-auteurs/index-auteurs.js';

import './auteurs/auteurs-directory.html';
import './auteurs/auteurs-directory.js';

import './index-constructeurs/index-constructeurs.html';
import './index-constructeurs/index-constructeurs.js';

import './index-marques/index-marques.html';
import './index-marques/index-marques.js';

import './index-titres/index-titres.html';
import './index-titres/index-titres.js';

import './index-s3/index-s3.html';
import './index-s3/index-s3.js';
*****************/

/*
import './pub-tester/pub-tester.html';
import './pub-tester/pub-tester.js';
*/

import './upload/upload.html';
import './upload/upload.js';


/*
Meteor.startup(()=>{
  Meteor.call('get-pub-directory',(err,directory)=>{
    if (err) throw err;
    console.log(`get-pub-directory =>`, directory.length);
      // then store this in localStore.
  });
})
*/
