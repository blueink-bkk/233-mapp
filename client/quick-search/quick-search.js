import './jj-intro.html';
import './jpc-address.html';
import './modal.html';
import './cc-warnings.html';

import './date-range-slider.html'
import './date-range-slider.js'

import './subIndex-panel.html'
import './subIndex-panel.js'

import './articles.js'

import './preview-panel.html'
import './preview-panel.js'


import {bh_init, bh_search} from '../bh-engine.js'
const TP = Template['quick-search'];

import { ReactiveDict } from 'meteor/reactive-dict';

import {app} from '../app-client.js';

//import i18n from 'meteor/universe:i18n';

// ============================================================================

TP.onCreated(function(){
  const tp = this;

  app.date_range = new ReactiveDict();
  tp.data_timeStamp = new ReactiveVar(null);
  tp.data_ready = new ReactiveVar(false);
  tp.data.catalogsCount = new ReactiveVar();
  tp.data.articlesCount = new ReactiveVar();
  tp.data.subIndex_Count = new ReactiveVar(0);

  if (!app.subIndex) throw `fatal no subIndex`;

  Meteor.call('museum-index',async (err,data)=>{
    if (err) {
      console.log(`museum-index crash err:`,err)
// TODO: display a warning.
      throw 'museum-index crash';
    }

    console.log('museum-index etime:%d ms  for %d entries:',
      data._etime, data.rows.length);
    console.log('@49 data.rows:',data.rows);

    app.index = data.rows; //.sort((a,b)=>{return (a.yp < b.yp)});
    let catCount =0, aCount =0;
    app.index.forEach(row =>{
      if (+row.sec ==3) aCount++; else catCount++;
      if (row.deleted) throw "found a deleted row..."
      /***
            transcriptions
      ***/
      if (row.transcription) {
        console.log(`@62 transcription #${row.xid} pic:<${row.pic}>`)
      }
      if (row.pic.includes('missing')) {
        console.log(`@62 transcription #${row.xid} pic:<${row.pic}>`)
        row.pic = '../transcription-reduced-20200224'
      }
    })
    console.log(`found ${catCount} catalogs and ${aCount} articles`)
    tp.data.catalogsCount.set(catCount);
    tp.data.articlesCount.set(aCount);

    const p1 = await bh_init(app.index);
//    console.log('onCreated p1:',p1)
    console.log(`bh_init done.`);
    tp.data_timeStamp.set(new Date()); // will trigger screen refresh
    tp.data_ready.set(true);
  }); // call.
});

// ============================================================================

TP.onRendered(function() {
  this.clear_messages = function(){
    console.log('clear-messages');
  }
});

// ================================================================================


TP.helpers({
  selected: function(event, suggestion, datasetName) {
    // event - the jQuery event object
    // suggestion - the suggestion object
    // datasetName - the name of the dataset the suggestion belongs to
    // TODO your event handler here
    console.log(event);
    console.log('suggestion:',suggestion);
    console.log(datasetName);
  }
});

TP.helpers({
  show_intro:()=>{
    return app.state.get('show-intro');
  },
  data_ready: ()=>{
    return Template.instance().data_ready.get();
  },
});


// ================================================================================

TP.events({
  'typeahead:selected' : (e,tp) =>{
    console.log('typeahead:selected',e);
    return false;
  },
  'typeahead:cursorchange': function(){
    console.log('typeahead:cursorchange');
    return false;
  },
  'typeahead:open': function(){
    console.log('typeahead:open');
    return false;
  },
  'typeahead:render': function(){
    console.log('typeahead:render');
    return false;
  },
  'typeahead:autocomplete' : (e,tp) =>{
    console.log('typeahead:changed',e);
    return false;
  }
});

// ----------------------------------------------------------------------------

TP.events({
  'input .js-typeahead': (e,tp)=>{
    tp.clear_messages();
    const value = e.target.value;

    if (value.startsWith('##')) {
      console.log('> list-all index.length:',app.index.length);
      app.subIndex.set(app.index.array());
      //app.subIndex_timeStamp.set(new Date().getTime());
      console.log('> list-all subIndex.length:',app.subIndex.length);
      return false;
    }

    if (value.length < 3) {
      return false;
    }
//      tp.cc_list = asearch(e.target.value);

    /*
    let _searchText = normalize(value.replace(/[,:;\+\(\)\-\.]/g,' '));
    Session.set('actual-search-text',_searchText);
    */

    const results = bh_search(value) // => subIndex - ONLY used here.
    console.log('results.length:',results.length);
    tp.data.subIndex_Count.set(results.length)
    results.sort((a,b)=>{return (a.yp > b.yp)});
    app.subIndex.set(results);
    if (results.length >0) {
      app.state.set('show-intro',false)
    }
    return false;
  }
});

// ----------------------------------------------------------------

TP.events({ // doing nothing now.
  'keyup .js-typeahead': (e,tp)=>{
    if (e.key == 'Enter') {
//      console.log('Do something.');
    }
    return false;
  }
});

// ------------------------------------------------------------------

TP.events({
  'click #js-changer': (e,tp)=>{
    let modal = document.getElementById('myModal');
    e.stopPropagation();
//            FlowRouter.go('index');
    console.log('ESC');
    console.log('modal.style.display:',modal.style.display);
    if (modal.style.display == "block") {
      modal.style.display = 'none';
      var span = document.getElementsByClassName("close")[0];
      span.onclick = function() {
        modal.style.display = "none";
      }
      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
          if (event.target == modal) {
              modal.style.display = "none";
          }
      }
    } else {
      modal.style.display = 'block';
//      document.forms.form1.elements['entry'].focus();
    }
    return false;

  }
});



FlowRouter.route('/quick-search', {
  name: 'quick-search',
  action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('quick-search');
    }
});
