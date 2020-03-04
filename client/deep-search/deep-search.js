const assert = require('assert')
import '../quick-search/jj-intro.html';
import '../quick-search/jpc-address.html';
import '../quick-search/modal.html';
import '../quick-search/cc-warnings.html';

import '../quick-search/date-range-slider.html'
import '../quick-search/date-range-slider.js'

import '../quick-search/subIndex-panel.html'
import '../quick-search/subIndex-panel.js'

import '../quick-search/articles.js'

import '../quick-search/preview-panel.html'
import '../quick-search/preview-panel.js'


import {bh_init, bh_search} from '../bh-engine.js'
const TP = Template['deep-search'];

import { ReactiveDict } from 'meteor/reactive-dict';

import {app} from '../app-client.js';

let vpath = 'museum.pdf'

// ============================================================================

const pub = [
'jpc-french-and-english/J10 JPC HA FREN connection boxes for temperature sensors 20170925.png',
'jpc-french-and-english/J11 JPC HA FREN connection boxes for immersion heaters 20170925.png',
'jpc-french-and-english/J12 JPC HA FREN brass and stainless steel fittings for immersion heaters 20170925.png',
'jpc-french-and-english/J13 JPC HA FREN flow switches 20170925.png',
'jpc-french-and-english/J14 JPC HA FREN Thermostat 20170925.png',
'jpc-french-and-english/J1 JPC HA FREN thermostats and controllers with protection housings 20170925.png',
'jpc-french-and-english/J2 JPC HA FREN plastic connection blocks for enclosures 20170925.png',
'jpc-french-and-english/J3 JPC HA FREN ceramic connection blocks for high temperature 20170925.png',
'jpc-french-and-english/J4 JPC HA FREN fusible links and fire detection glass bulb links 20170925.png',
'jpc-french-and-english/J5 JPC HA FREN silicone boots and enclosures for flexible silicone heaters 20170925.png',
'jpc-french-and-english/J6 JPC HA FREN air switches and pressure switches for spas and swimming pools 20170925.png',
'jpc-french-and-english/J7 JPC HA FREN fixed setting and adjustable setting humidistats 20170925.png',
'jpc-french-and-english/J8 JPCHA FREN level switches 20170925.png',
'jpc-french-and-english/J9 JPC HA FREN connection boxes and silicone boots for heat tracing 20170925.png',
'jpci-french-and-english/C10 JPCI HA FREN connection boxes for temperature sensors 20170922.png',
'jpci-french-and-english/C11 JPCI HA FREN connection boxes for immersion heaters 20170922.png',
'jpci-french-and-english/C12 JPCI HA FREN brass and stainless steel fittings for immersion heaters 20170922.png',
'jpci-french-and-english/C13 JPCI HA FREN flow switches 20170922.png',
'jpci-french-and-english/C14 JPCI HA FREN Thermostat 20170922.png',
'jpci-french-and-english/C15 JPCI HA FREN heat pumps backup heaters and auxiliary liquid heaters 20190301.png',
'jpci-french-and-english/C16 JPCI HA FREN convection heaters 20190301.png',
'jpci-french-and-english/C17 JPCI HA FREN immersion heaters 20190301.png',
'jpci-french-and-english/C18 JPCI HA FREN jacket and blanket heaters 20190301.png',
'jpci-french-and-english/C19 JPCI HA FREN flexible industrial heaters 20190301.png',
'jpci-french-and-english/C1 JPCI HA FREN thermostats and controllers with protection housings 20170922.png',
'jpci-french-and-english/C3 JPCI HA FREN ceramic connection blocks for high temperature 20190301.png',
'jpci-french-and-english/C4 JPCI HA FREN fusible links and fire detection glass bulb links 20190301.png',
'jpci-french-and-english/C5 JPCI HA FREN silicone boots and enclosures for flexible silicone heaters 20170922-2.png'
]

function* get_a_pub_Maker() {
  var index =0;
  const max = pub.length;
  while (true) {
    index ++;
    const fn = pub[(index%max)]
    console.log(`pub[${index}]=> <${fn}>`)
    yield fn;
  }
}

const get_a_pub = get_a_pub_Maker();

// ============================================================================
const verbose =1;

TP.onCreated(function(){
  const tp = this;

  app.date_range = new ReactiveDict();
  tp.data_timeStamp = new ReactiveVar(null);
//  tp.data_ready = new ReactiveVar(false);
  tp.data.catalogsCount = new ReactiveVar();
  tp.data.articlesCount = new ReactiveVar();
  tp.data.subIndex_Count = new ReactiveVar(0);

  if (!app.subIndex) throw `fatal no subIndex`;

  Meteor.call('pdf-pages-count',(err,data)=>{
    verbose && console.log(`results ready from pdf-page-count.`)
    if (err) throw err;
    const {pdf_count, pdf_pages_count} = data;
    console.log(`${pdf_count} pdf-files -- ${pdf_pages_count} pdf-pages`)
    app.state.set('pdfpagesCount',pdf_pages_count);
    app.state.set('pdfCount', pdf_count);
    verbose && console.log(`leaving results from pdf-page-count.`)
  })

  // ------------------------------------------------------------------------

  tp.deep_search = function(query) {
    tp.max_results_reached.classList.add('nodisplay')
    //    tp.execute_query(query);
    Meteor.call('deep-search',{vpath, query}, (err,data)=>{
      //tp.etime.set(new Date().getTime() - etime);
      if (err) {
        console.log(`ERROR Meteor.call(deep-search)
        query:"${query}"
        `, err);
//        tp.q.set('q4::Syntax or System Error! retype your query.') // system or syntax error
        return;
      }

      if (!data) {
//        tp.q.set('q3::No result for this query BAD!.');
        console.log(`NO DATA for this.`);
        return
      }

      // const v = query_History.push({query:_query, pages:data.hlist.length});
      /*
      if (_query.trim().indexOf(' ')<0) {
        console.log(`Single Word Mode (${_query}). Sorting...`)
        // single word search: check if word found in headline
        // sort if (flag,url, pageno)
        data.hlist.forEach(it => {
          it.sflag = (it.h1.toLowerCase().indexOf(_query.toLowerCase())<0) ? 1:0
          //if (it.sflag == 0) console.log(`(${it.sflag}) ${it.h1}`);
        })
        data.hlist = data.hlist.sort((a,b)=>{
          if (a.sflag != b.sflag) return a.sflag - b.sflag;
          if (a.url != b.url) return (a.url.localeCompare(b.url));
          return (a.pageno - b.pageno)
        });
      }

      tp.hlist.set(data.hlist);
      tp.q.set(`q3:: .`)
      tp.audit.set(data.audit);
      */

      const {pages, audit, etime} = data;
      console.log(`found ${pages.length} pdf-pages data:`,data)
      tp.data.subIndex_Count.set(pages.length)
      if (pages.length >=500) {
        tp.max_results_reached.classList.remove('nodisplay')
      }
      app.subIndex.set(pages);
      if (pages.length >0) { // OBSOLETE
        app.state.set('show-intro',false)
      }
      tp.busy_flag.classList.add('hidden')

    }); // call deep-search
  } // function dee_search
  verbose && console.log(`leaving deep-search.onCreated`)
}); // onCreated


// ============================================================================

TP.onRendered(function() {
  verbose && console.log(`entering deep-search.onRendered`)
  const tp = this;
  this.clear_messages = function(){
    console.log('clear-messages');
  }
  verbose && console.log(`leaving deep-search.onRendered`)
});

// ================================================================================

TP.helpers({
  modulo(x,i) {return x && (x%i==0);},
  get_a_pub() {return get_a_pub.next().value;}
});


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
  pdfCount() {
    return app.state.get('pdfCount')
  },
  pdfpagesCount() {
    return app.state.get('pdfpagesCount')
  },
  trimfn: (fn)=>{
    return fn.replace(/[0-9]*\.pdf$/,'')
  },
  split_newlines: (txt)=>{
    return txt.replace(/\\n/g,'<span style="display:inline-block; height:22px;">&hellip;</span><br>&hellip; ')
  },
  /*
  data_ready: ()=>{
    return Template.instance().data_ready.get();
  },*/
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
  'click .js-deep-search_': (ev,tp)=>{
    // get query from input, not event.
    console.log('js-deep-search:',tp.find('input'));
    const query = tp.find('input').value;
    tp.deep_search(query);
  },
  'keyup': (ev,tp)=>{
    //console.log('search_panel.keyup');
//    tp.q.set('q1::keep typing then - CR to search.'); // button is displayed.
//    tp.hlist.set([]); // results
    if (ev.keyCode == 13) {
      app.state.set('show-intro',false)
      tp.max_results_reached = tp.find('span.js-max_results_reached')
      tp.max_results_reached.classList.add('nodisplay')
      tp.busy_flag = tp.find('div.js-busy-flag');
      tp.busy_flag.classList.remove('hidden')
      tp.deep_search(ev.target.value);
    }
  },
});

TP.events({ // doing nothing now.
  'keyup .js-typeahead': (e,tp)=>{
    if (e.key == 'Enter') {
//      console.log('Do something.');
    }
    return false;
  },
});

// ----------------------------------------------------------------------------

TP.events({
  'input .js-typeahead_____': (e,tp)=>{
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
    app.subIndex.set(results);
    if (results.length >0) {
      app.state.set('show-intro',false)
    }
    return false;
  }
});

// ----------------------------------------------------------------


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



FlowRouter.route('/deep-search', {
  name: 'deep-search',
  action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        vpath = queryParams['path'] || 'museum.pdf'
        Session.set('tvec-path',vpath)
        console.log(`tvec_path:`,vpath)
        BlazeLayout.render('deep-search');
    }
});

TP.events({
  'click .js-clear-search-results': (e,tp)=>{
    tp.data.subIndex_Count.set(0)
    app.subIndex.set([]);
    app.state.set('show-intro',false);
    tp.max_results_reached = tp.find('span.js-max_results_reached')
    tp.max_results_reached.classList.add('nodisplay')
    const inp = tp.find('input.js-deep-search');
    console.log('inp:',inp)
    inp.value = ''
  }
})
