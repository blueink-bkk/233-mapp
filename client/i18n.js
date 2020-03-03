/*
  just-i18n package for Meteor.js
  author: Hubert OG <hubert@orlikarnia.com>
*/


var maps            = {};
var language        = '';
var defaultLanguage = 'en';
var missingTemplate = '';
var showMissing     = false;
var dep             = new Deps.Dependency();


/*
  Convert key to internationalized version
*/
i18n = function(...args) {
  dep.depend();
//  console.log(arguments)
  var label;
//  var args = _.toArray(arguments);
//  var args = ...arguments;

  /* remove extra parameter added by blaze */
  if(typeof args[args.length-1] === 'object') {
    args.pop();
  }

  var label = args[0];
  args.shift();


  if(typeof label !== 'string') return '';
  var str = (maps[language] && maps[language][label]) ||
         (maps[defaultLanguage] && maps[defaultLanguage][label]) ||
         (showMissing && _.template(missingTemplate, {language: language, defaultLanguage: defaultLanguage, label: label})) ||
         '';

  console.log(`@40 replaceWithParams(${str}) w:`,args)
  str = replaceWithParams(str, args)
  return str;
};

/*
  Register handlebars helper
*/
if(Meteor.isClient) {
  if(UI) {
    UI.registerHelper('i18n', function () {
      return i18n.apply(this, arguments);
    });
  } else if(Handlebars) {
    Handlebars.registerHelper('i18n', function () {
      return i18n.apply(this, arguments);
    });
  }
}

function replaceWithParams(string, params) {
  var formatted = string;
  params.forEach(function(param , index){
    var pos = index + 1;
    formatted = formatted.replace("{$" + pos + "}", param);
  });

  return formatted;
};

/*
  Settings
*/
i18n.setLanguage = function(lng) {
  language = lng;
  dep.changed();
};

i18n.setDefaultLanguage = function(lng) {
  defaultLanguage = lng;
  dep.changed();
};

i18n.getLanguage = function() {
  dep.depend();
  return language;
};

i18n.showMissing = function(template) {
  if(template) {
    if(typeof template === 'string') {
      missingTemplate = template;
    } else {
      missingTemplate = '[<%= label %>]';
    }
    showMissing = true;
  } else {
    missingTemplate = '';
    showMissing = false;
  }
};

/*
  Register map
*/
i18n.map = function(language, map) {
  if(!maps[language]) maps[language] = {};
  registerMap(language, '', false, map);
  dep.changed();
};

var registerMap = function(language, prefix, dot, map) {
  if(typeof map === 'string') {
    maps[language][prefix] = map;
  } else if(typeof map === 'object') {
    if(dot) prefix = prefix + '.';
    /*
    _.each(map, function(value, key) {
      registerMap(language, prefix + key, true, value);
    });*/
    Object.keys(map).forEach(key =>{
      registerMap(language, prefix + key, true, map[key]);
    })
  }
};

  i18n.setLanguage('en-US');
  i18n.map('en-US',{
    ping: 'pong',
    ui: {
      'quick-search-is-done-by': 'The search is done by entering at least the first 3 characters of the searched word, then by selecting among the propositions which appear.',
      'search-made-on2': 'Search is made on {$1} catalogs and {$2} articles.'
    }
  });


Template.registerHelper('__', function(...args) {
  const label = args.shift();
  var str = (maps[language] && maps[language][label])
    || (maps['en-US'] && maps['en-US'][label])
  if (!str) {
    return label;
  }
  const retv = replaceWithParams(str, args)
  return retv;
})

/*
Template.registerHelper('___', function (args) {
//  const retv = i18n(args) || args[0]
  console.log(`@7 globalhelper i18n:`,args)
  if (Array.isArray(args)) {
    const retv = i18n(args);
    console.log(`@9 retv:`,retv)
    return retv;
  } else {
    try {
      const retv = i18n(args) || args;
      console.log(`@14 retv:`,retv)
      return retv;
    }
    catch(err) {
      console.log(`i18n error:`,err)
    }
  }
}); */
