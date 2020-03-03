const assert = require('assert');
//import i18n from 'meteor/universe:i18n';
//import '../i18n/en.i18n.yml';
//import '../i18n/fr.i18n.yml';

FlowRouter.triggers.enter([
  function(context, redirect) {
    console.log('main-trigger context.queryParams:',context.queryParams);

    const cur_lang = Session.get('cur-lang');
    const lang = context.queryParams.lang
      || cur_lang || 'en';


    return; ///////////////////////////////////////////////////////////////

    if (lang != TAPi18n.getLanguage()) {
      TAPi18n.setLanguage(lang)
      .done(function () {
        //console.log('switching to lang:',lang)
        assert((TAPi18n.getLanguage() == lang), 'fatal-15.0');
        Session.set('cur-lang',lang);
      })
      .fail((err) => {
          // Handle the situation
        console.log('failed to switch to lang:',lang)
        console.log('TAPi18n: ',err);
      });
    }


    console.log('-- trigger language:',TAPi18n.getLanguage())
    console.log('-- languages:',TAPi18n.getLanguages())
  }
]);
