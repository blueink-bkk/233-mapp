Template.registerHelper('session',function(input){
    return Session.get(input);
});




/**************
Template.registerHelper('___', function (...args) {
  console.log(`global-helper __()`,args)
  return (args[0])
    const kw = args.pop();
    if (typeof args[args.length-1] === 'string') {
        args.push(kw.hash);
    }
    console.log(`@86 args:`,args)
    const t = args[0] || '';
    if (t[0] === '.') {
        args.shift();
        return __(getNamespace() + t, ...args);
    }
    console.log(`@92 return __(...args):`,(args));
    console.log(i18n._translations)
//    let x = i18n.get(i18n._translations, 'ui.argv1');
//    console.log(`@97 x:`,x)
//    return __(...args);
//    return __('ui.argv1',[[123,765],'hello'])
    return __('ui','argv1',{catalogs:123, articles:456})
});
****************/
