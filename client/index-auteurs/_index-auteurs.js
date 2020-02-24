const TP = Template['index-auteurs'];

FlowRouter.route('/index-auteurs', {
  name: 'index-auteurs',
  action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-auteurs');
    }
});
