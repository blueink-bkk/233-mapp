const fs = require('fs')
const yaml = require('js-yaml');


export async function get_yaml_config(files, tail='/.upload/config.yaml') {
  return new Promise((resolve,reject)=>{
    /*
    if (!Array.isArray(files)) {
//      throw 'fatal get_yaml_config(files) -- files must be an Array'
      reject('fatal get_yaml_config(files) -- files must be an Array');
      return;
    }*/

    if (!files || !files.length) {
      reject('fatal get_yaml_config(files) -- files must be an Array');
      return;
    }

    let file;
    for (let ix=0; ix<files.length; ix++) {
      if (files[ix].webkitRelativePath.endsWith(tail)) {
        file = files[ix];
        break;
      }
    }

    if (!file) {
      resolve({error:'file-not-found'})
      return;
    }

    let reader = new FileReader();

    reader.onloadend = function(e) {
      console.log(`reader.result: (${reader.result})`);
      if (reader.result.length <=0) {
        resolve ({});
        return;
      }
//      var doc = yaml.safeLoad(fs.readFileSync(path.join(dirname,'.config.yaml'), 'utf8'));
      var doc = yaml.safeLoad(reader.result);
      console.log('yaml:',doc);
      resolve(doc);
      return;
    };

//    reader.readAsArrayBuffer(file)
//    reader.readAsBinaryString(file);
    reader.readAsText(file);
  })
}

// ---------------------------------------------------------------------------
