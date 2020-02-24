const app = require('../client-app.js');

const TP = Template.subIndex_panel;

TP.onRendered(function(){
  let entries = $('.entry'); // showing-hiding according to dates.
  console.log('entries:',entries.length);
  let year_from = app.search_state.get('year-from');
  let year_to = app.search_state.get('year-to');
  entries.each((j,e)=>{
//      console.log(`--${j} year:${$(e).attr('year')} =>${e}`);
    let year = $(e).attr('year');
    if (year < year_from) {
      $(e).hide();
    } else if (year > year_to) {
      $(e).hide();
    } else {
      $(e).show();
    }
  });
  return;
  const e = this.find('div.cc-entry');
  console.log(' -- cc-entry:',e);
  highlight(e, _searchText);
});


TP.helpers({
  subIndex: function() { // result of a search.
    const si = app.subIndex.get();
    console.log('subIndex.helper subIndex.length:',si.length);
    return si;
  },
  full_version() {
    const si = app.subIndex.get();
    return (si && si.length < 77);
  },
  subIndex_length() {
    const si = app.subIndex.get();
    return si && si.length;
  },
});


TP.helpers({
  links(x) {
    x.forEach((it)=>{console.log('--',it);});
//    console.log(' -- links: '+x);
  }
});

/********************************
TP.events({ // could be in article.js !!!!
  'click .js-title': (e,tp)=>{
//    console.log('> search for exact title e:',e);
    console.log('> search for exact title <%s>:',e.currentTarget.text);
//    const v = find_article_byTitle(e.currentTarget.text.toLowerCase());
    const r = Meteor.publibase.index_lookup(e.currentTarget.text.toLowerCase());
    if (r.err) {
      console.log('ERROR:',r.err);
    } else {
      let ni = r.data.length;
      console.log('-- found %d items',ni);
      if (ni > 0) {
        console.log('-- found item %d',r.data[0].id);
        console.log('--- r.data[0].headline: ', r.data[0].headline);
        console.log('--- r.data[0].value: ', r.data[0].value);
//        FlowRouter.setParams({id: r.data[0].id});
          FlowRouter.go('cc-article', {id:r.data[0].id});
      }
      else {
        console.log('-- index-lookup NO items found: ', r.err);
      }
    }
    return true;
  }
});
**********************************/
