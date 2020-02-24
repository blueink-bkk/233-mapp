const Bloodhound = require('bloodhound-js');

Meteor.startup(() =>{

  const index = [];
  for (let i=0; i<20; i++) {
    for (let j=0; j<6; j++) {
      index.push({id:i*10+j, name: `line${i*10} col${j}`});
    }
  }

const bh_engine = new Bloodhound({ // only used here in index.
    local: index, //[{name:'dog'}, {name:'pig'}, {name:'moose'}],
    init: false,
    identify: function(obj) { return obj.id; },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name); // normalized
    }
}); // engine


console.log(index)

const p1 = bh_engine.initialize()
console.log('test-bh p1:',p1)
p1.then(() => {
//  const p2 = bh_engine.add(index); // not a promise.
//  console.log('test-bh p2:',p2);

  bh_engine.search('line20 col3',
  function(d) { // sync
    console.log('bh_search => ', d.length);
    console.log(d)
  });
});

});
