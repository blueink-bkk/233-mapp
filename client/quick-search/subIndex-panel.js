import {app, update_subIndex_cursor} from '../app-client.js';

const TP = Template.subIndex_panel;

TP.onRendered(function(){
  let entries = $('.entry'); // showing-hiding according to dates.
  console.log('entries:',entries.length);
  let year_from = app.search_params.get('year-from');
  let year_to = app.search_params.get('year-to');
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
  pathFor (x) {return x;},
  subIndex: function() { // result of a search.
    const si = app.subIndex.get();
    console.log('subIndex.helper subIndex.length:', si && si.length);
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

TP.events({ // could be in article.js !!!!
  'click .js-article': (e,tp)=>{
    e.preventDefault();
    e.stopImmediatePropagation();

    const item_id = e.currentTarget.getAttribute('href');
    console.log('js-article => ', item_id);
//    console.log('js-article => ',e.currentTarget.getAttribute('href'));
    app.state.set('article-id', item_id); // to create the panel.
    update_subIndex_cursor(); // initialize the cursor, before displaying the article/preview.
    //  get_itemx(ai);
    Meteor.call('get-itemx',{item_id, opCode:'latest'},(err,data)=>{
      if (err) {
        throw 'fatal-@74 unable to get article'
      }

//      console.log('get-itemx =>data:',data);
/*
    fix pic
*/
if (data.data.transcription && data.data.pic.includes('missing')) {
  data.data.pic = '../transcription-reduced-20200224'
}

      app.article.set(data);
      if (false) {
        app.state.set('html',null);
        app.state.set('meta',data.row.content); // Museum is 100% pure YAML.
      }
      console.log('app.article:',app.article.get());
    }) // call

    return false;
  }
});
