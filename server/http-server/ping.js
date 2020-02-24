import {cms, db, package_id, _assert} from '../cms-api.js';

module.exports = function(req,res) {
  console.log(`ping => device-type:${req.device.type} dev:`,req.device)
  if (req.device.type.toLowerCase() == 'phone') {
    const html = SSR.render('phone-welcome',{
      /*
      it:page,
      isTranscription: ()=>{
        return (page.data.transcription);
      },
      part: (x)=>{
        if (x>0) {
          return `part:${x+1} - `;
        }
      },*/
      _: function(key){return TAPi18n.__(key)}
    });
    res.status(200)
    .end(html);
    return;
  }
  // else
  const html = SSR.render('phone-welcome',{
    /*
    it:page,
    isTranscription: ()=>{
      return (page.data.transcription);
    },
    part: (x)=>{
      if (x>0) {
        return `part:${x+1} - `;
      }
    },*/
    _: function(key){return TAPi18n.__(key)}
  });
  res.status(200)
  .end(html);
};
