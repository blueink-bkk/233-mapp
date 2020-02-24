import { ReactiveDict } from 'meteor/reactive-dict';

const app = require('../client-app.js');

const TP = Template.index;


// ============================================================================

TP.onCreated(function(){
  const tp = this;
//  tp.state = new ReactiveDict(); // replace Session.
//  tp.state.set('show-intro',true);
  app.date_range = new ReactiveDict();

  new Promise((resolve,reject)=>{
    Meteor.call('museum-index',(err,data)=>{
      if (err) reject(err);
      resolve(data);
    })
  })
  .then(data =>{
    console.log('museum-index etime:%d ms  for %d entries:',
      data._etime, data.rows.length);
    console.log('data.rows:',data.rows);
    app.load_index(data.rows);
    return app.bh_init();
    // subIndex is a reactive-array
  })
  .then(()=>{
    console.log('bh-init done Ok.');
  })
  .catch(err =>{
    console.log('err:',err);
  })
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

    app.bh_search(value) // => subIndex - ONLY used here.
    .then(si =>{
      console.log('subIndex.length:',si.length);
    })
    .catch(err =>{
      console.log('bh-search err:',err);
    })
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
