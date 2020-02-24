const TP = Template['index-titres'];

FlowRouter.route('/index-titres', {
  name: 'index-titres',
  action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-titres');
    }
});
