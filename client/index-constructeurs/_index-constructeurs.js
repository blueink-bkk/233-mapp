const TP = Template['index-constructeurs'];

FlowRouter.route('/index-constructeurs', {
  name: 'index-constructeurs',
  action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-constructeurs');
    }
});
