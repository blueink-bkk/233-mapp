import {app, next_article} from '../app-client.js';
const assert = require('assert');

const TP = Template.article;

TP.onCreated(function(){
  /*
  let ai = FlowRouter.getParam("id");
  console.log('> article.onCreated ai:',ai);
  assert(ai, "FATAL 7F3W")
  */

  let ai = app.state.get('article-id')
  console.log(`Template.article onCreated item_id:${ai}`)
  $(document).on('keyup', (e) => {
      if (e.which === 37) { // left
         e.stopPropagation();
        let ai = Meteor.publibase.next_article(-1);
//        FlowRouter.setParams({id:ai});
         return false;
      }
      if (e.which === 39) { // right
         e.stopPropagation();
         let ai = Meteor.publibase.next_article(+1);
//         FlowRouter.setParams({id:ai});
         return false;
      }
      if (e.which === 27) { // right
         e.stopPropagation();
//         FlowRouter.go('index');
         return false;
      }

      console.log(e.which)
    });
});

TP.onDestroyed(function(){
    $(document).off('keyup');
});


// ==========================================================================

TP.onRendered(function(){
  /*
  let ai = FlowRouter.getParam("id");
  console.log('> article.onRendered ai:',ai);
  assert(ai, "FATAL 7F3W")
  */
  const xid = app.state.get('article-id');
  console.log(`Template.article onRendered item_id:${xid}`)
  const article = app.article.get();
  console.log(`Template.article onRendered article:`,{article})

});

// ==========================================================================

/*
const clear_messages = function(){
  Session.set('ui-message','');
  Session.set('ui-warning','');
  Session.set('ui-error','');
}
*/

TP.events({
  'click .js-index': (e,tp)=>{
    throw "FATAL 77"
    clear_messages();
//    Meteor.publibase.article_html_preview.set(null);
//    Meteor.publibase.article_html.set(null);
    FlowRouter.go('cc-index');
    return false;
  }
});

/**
TP.events({ // could be in article.js !!!!
  'click .js-title': (e,tp)=>{
    throw "FATAL 78"
//    console.log('> search for exact title e:',e);
    console.log('> search for exact title <%s>:',e.currentTarget.text);
//    const v = find_article_byTitle(e.currentTarget.text.toLowerCase());
    const x = Meteor.publibase.index_lookup(e.currentTarget.text.toLowerCase());
    if (x.err) {
      Session.set('ui-error', x.err);
      return false;
    }

    switch(x.data.length) {
      case 0: Session.set('ui-warning','Aucun resultat.(2)'); break;

      case 1:
      FlowRouter.setParams({id: x.data[0].id});
      break;

      default:
      Session.set('ui-warning','multiple results');
      FlowRouter.setParams({id: x.data[0].id});
      break;
    }
    return false;
  }
});
**/

// =======================================================================

TP.helpers({
  pathFor(x) {
    return x;
  },
  article() {
    console.log(`template.article helper article:`, app.article.get());
    return app.article.get();
  },
  subIndex_count() {
    const a = app.subIndex.get();
    return a && a.length;
  }

});

// --------------------------------------------------------------------------

TP.events({
  'click .js-back-to-search-results': (e,tp)=>{
    console.log('js-back-to-search-results e:',e);
//    app.state.set(null);
//    app.article.set(null); // should close the panel. NO
    app.state.set('article-id', null); // this one close the panel
  }
})

// --------------------------------------------------------------------------

TP.events({
  'click .js-next-article': (e,tp)=>{
    console.log('next-article e:',e);
    //clear_messages();
    const item_id = next_article(+1);
    console.log(`current-article: ${app.state.get('article-id')} next is item_id:${item_id}`)
    app.state.set('article-id', item_id);

    Meteor.call('get-itemx',{item_id, opCode:'latest'},(err,data)=>{
      if (err) {
        throw 'fatal-@74 unable to get article'
      }

      console.log('get-itemx =>data:',data);
      app.article.set(data); // will be used by preview-panel.
      if (false) {
        app.state.set('html',null);
        app.state.set('meta',data.row.content); // Museum is 100% pure YAML.
      }
      console.log('app.article:',app.article.get()); // to debug.
    }) // Meteor.call
  }
}); // events.

// --------------------------------------------------------------------------

TP.events({
  'click .js-prev-article': (e,tp)=>{
    //clear_messages();
    const item_id = next_article(-1); // based on flowrouter.getParams
    if (!item_id) throw 'fatal-@192';

    app.state.set('article-id', item_id);

    Meteor.call('get-itemx',{item_id, opCode:'latest'}, (err,data)=>{
      if (err) {
        throw 'fatal-@74 unable to get article err: '+err;
      }

      app.article.set(data); // will be used by preview-panel.
      if (false) {
        app.state.set('html',null);
        app.state.set('meta',data.row.content); // Museum is 100% pure YAML.
      }
    }) // call

    return false;
  }
});


// --------------------------------------------------------------------------
