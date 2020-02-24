

function flip(e,tp) {
  const list = tp.findAll('.js-local-directory');
//  console.log(`>click .js-table found btn:${list.length}`)

  // reset all buttons except this one. and clear the print-area

  list.forEach(tab =>{
    if (tab == e.target) {
      if (!tab.classList.contains('active-up')) {
        tab.classList.add('active-up')
        tab.classList.remove('active-down')
      } else {
        tab.classList.add('active-down')
        tab.classList.remove('active-up')
      }
    } else {
      tab.classList.remove('active-up')
      tab.classList.remove('active-down')
      e.stopImmediatePropagation();
    }
  })
}


Template.upload.events({
  'click .js-local-fname': (e,tp)=>{
    console.log(`>click:`,e.target)
    flip(e,tp);
    const li = tp.data.local_directory.get();
    if (e.target.classList.contains('active-up')) {
      li.sort((a,b)=>{
        return (a.name.localeCompare(b.name))
      })
    } else {
      li.sort((a,b)=>{
        return (b.name.localeCompare(a.name))
      })
    }
    tp.data.local_directory.set(li);
    return false;
  },
  'click .js-local-size': (e,tp)=>{
    flip(e,tp);
    console.log(`>click:`,e.target)
    const li = tp.data.local_directory.get();
    if (e.target.classList.contains('active-up')) {
      li.sort((a,b)=>(a.size - b.size))
    } else {
      li.sort((a,b)=>(b.size - a.size))
    }
    tp.data.local_directory.set(li);
    return false;
  },
  'click .js-local-lastModified': (e,tp)=>{
    flip(e,tp);
    console.log(`>click:`,e.target)
    const li = tp.data.local_directory.get();
    if (e.target.classList.contains('active-up')) {
      li.sort((a,b)=> (a.lastModified - b.lastModified))
    } else {
      li.sort((a,b)=> (b.lastModified - a.lastModified))
    }
    tp.data.local_directory.set(li);
    return false;
  },
});
