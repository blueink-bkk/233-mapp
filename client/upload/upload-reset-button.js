Template.upload_reset_button.onCreated(function(){
  const tp = this;
})

Template.upload_reset_button.onRendered(function(){
  const tp = this;
  const input = tp.find('input');
  input.value = "restart"
})

Template.upload_reset_button.events({
  'click': (e,tp)=>{
    e.stopImmediatePropagation();
    console.log('click target:',e.target);
    console.log('tp.data:', tp.data);
    // we should let the parent take care of it.
    return false;
  }
})

Template.upload_reset_button.helpers({
  caption() {
    const tp = Template.instance();
    const nuploads = tp.data.upload_count.get();
    console.log('n-uploads:',nuploads)
    return (nuploads>0)? 'Cancel':'Reset';
  }
});
