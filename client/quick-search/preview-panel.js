import {app} from '../app-client.js';

Template.preview_panel.onCreated(function(){});

Template.preview_panel.onRendered(function(){});

Template.preview_panel.helpers({
  it() {
//    console.log(`preview-panel helper: app.article:`,app.article.get());
    return app.article.get();
  },
  isTranscription() {
    let _meta = app.state.get('meta')
    return (_meta && (_meta.flag == 'T'));
  },
  part(x) {
    if (x>0) {
      return `part:${x+1} - `;
    }
  },
  raw_data() {
    const o = app.article.get();
    return o && JSON.stringify(o);
  }

});
