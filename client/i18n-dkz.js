//const fs = require('fs')
const yaml = require('js-yaml');

/*
'./i18n/en.i18.yml'

const data_en = yaml.load(file.getContentsAsString() ,{
  schema: yaml.FAILSAFE_SCHEMA,
   onWarning: console.warn.bind(console)
})

console.log(data_en)
*/

module.exports = {
  i18n_setup : ()=>{
    i18n.setLanguage('en-US');
    i18n.map('en-US',{
      ping: 'pong',
      ui: {
        'quick-search-is-done-by': 'The search is done by entering at least the first 3 characters of the searched word, then by selecting among the propositions which appear.',
        'search-made-on2': 'Search is made on {$1} catalogs and {$2} articles.'
      }
    })

    Template.registerHelper('___', function (...args) {
        const kw = args.pop();
        console.log(`@28 _3_ kw:`,kw)
        if (typeof args[args.length-1] === 'string') {
            args.push(kw.hash);
        }
        console.log(`@32 _3_ kw:`,kw)
        const t = args[0] || '';
        console.log(`@34 _3_ t:`,t)
        if (t[0] === '.') {
            args.shift();
            return __(getNamespace() + t, ...args);
        }

        return i18n(...args);
    });

    Template.registerHelper('__', function (args) {
    //  const retv = i18n(args) || args[0]
      console.log(`@7 globalhelper i18n:`,args)
      if (Array.isArray(args)) {
        const retv = i18n(args);
        console.log(`@9 retv:`,retv)
        return retv;
      } else {
        const retv = i18n(args) || args;
        console.log(`@14 retv:`,retv)
        return retv;
      }
    });


    return false;
  }
}
