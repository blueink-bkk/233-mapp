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


import './index-titres/index-titres.html';
import './index-titres/index-titres.js';

*****************/


import './index-s3/index-s3.js';
import './index-marques/index-marques.js';
import './index-auteurs/index-auteurs.js';
import './index-constructeurs/index-constructeurs.js';
import './xid/xid.js';

/*
import './pub-tester/pub-tester.html';
import './pub-tester/pub-tester.js';
*/

import './upload/upload.html';
import './upload/upload.js';

//import './i18n.js'; // create global ver i18n
//import {i18n_setup} from './i18n-dkz.js';
//i18n_setup();
//console.log(`@58 startup getLanguage:`,i18n.getLanguage())

import i18n from 'meteor/universe:i18n';
import '../i18n/en.i18n.yml';
import '../i18n/fr.i18n.yml';

Template.registerHelper('session', (key)=>{
  return Session.get(key)
})


i18n.onChangeLocale (function(newLocale){
    console.log(`new-locale:`,newLocale);
    return;
    i18n.loadLocale(newLocale)
    .then(x=>{
      console.log(`then x:`,x)
    })
})

i18n.setOptions({
  defaultLocale:'fr',
  purify: (s)=>s
})

Meteor.startup(()=>{
});
