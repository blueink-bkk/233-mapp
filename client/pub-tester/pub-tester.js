import {app, _assert} from '../app-client.js';

const files = [];

const TP = Template['pub-tester'];

TP.onCreated(function(){
  if (files.length <=0) {
    Meteor.call('get-pub-directory',(err,_files)=>{
      if (err) throw err;
      files.concat(..._files);
      console.log(`${files.length} files in pub-directory.`)
    })
  }
})

TP.helpers({
  counter() {
    return app.state.get('pub-counter')
  }
})


FlowRouter.route('/pub-tester', { //name: 'auteurs_directory',
    action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('pub-tester');
    }
});
