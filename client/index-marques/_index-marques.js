const TP = Template['index-marques'];

FlowRouter.route('/index-marques', {
  name: 'index-marques',
  action: function(params, queryParams){
        console.log('Router::action for: ', FlowRouter.getRouteName());
        console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
        BlazeLayout.render('index-marques');
    }
});
