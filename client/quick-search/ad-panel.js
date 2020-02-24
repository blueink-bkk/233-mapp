Template.ad_server_panel.helpers({
  url: ()=>{
    console.log('location:',window.location.origin);
    return location.origin + '/ad-server';
  }
})

/*
Template.ad_server_panel.helpers({
  id() {
    let id = FlowRouter.getParam('id'); // to make it reactive
    return `${id}`;
  }
});
*/
