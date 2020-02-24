import {app} from '../app-client.js';

const TP = Template.modal1;

TP.onCreated(function(){
  console.log(`modal1.onCreated app:`,app)
});


TP.events({
  'click .js-quit': (e,tp)=>{
    let y = tp.find('#myModal')
    y.style.display = "none";
//    app.search_columns.push('yp');
/*
    let cols = Session.get('search-columns');
    cols = cols.map(it=>it.tag);
    cols.push('yp');
    Session.set('engine-search-columns',cols);
*/
  }
})


TP.helpers({
  search_columns() {
    return app.search_columns.list();
  },
  unused_columns() {
    return app.unused_search_columns();
  },
  alert(){
    return null;
    return Session.get('modal-alert');
  },
  appx() {
    return null;
  }
});


TP.events({
  'click .js-remove-col':(e,tp)=>{
    e.preventDefault();
    let tag = e.target.getAttribute('htag');
    const err = app.remove_search_column(tag);
    if (err) {
      console.log('ALERT');
      $('.modal-alert-animation')
          .removeClass('modal-alert-animation')
          .animate({'nothing':null}, 1, function () {
            $(this).addClass('modal-alert-animation');
          });
      //      $(tp.find('.js-remove-col')).removeClass("run-animation").addClass("run-animation");
      app.alert.set("ALERT: You must have at least one column.");
    }
    return false;
  },
  'click .js-add-column':(e,tp)=>{
    e.preventDefault();
    let tag = e.target.getAttribute('htag');
    app.add_search_column(tag);
    return false;
  },
  'click .js-add-all':(e,tp)=>{
    e.preventDefault();
    app.add_all_search_columns();
  }
});


TP.events({
  'click .js-marques'() {
    // build the index - prep the index - switch view.
    build_xref_marques();
  }
});
