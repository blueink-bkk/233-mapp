import {app, nor_fn1, _assert} from '../app-client.js';
const path = require('path');
const hash = require('object-hash');
import {get_yaml_config} from './get-yaml-config.js';
import {local_directory_check} from './local-directory-check';

require('./upload-local-directory.js')
require('./upload-remote-directory.js')
require('./upload-reset-button.js')

const verbose = 1;

function flags_add(file,s){
  file.flags = file.flags || new Set(); file.flags.add(s)
}

function has_flag(file,s){
  return file.flags && file.flags.has(s)
}


const TP = Template.upload;

TP.onCreated(function(){
  const tp = this;
  tp.state = new ReactiveDict();
  tp.server = {};
  tp.errors =[];
  tp.warnings =[];
  tp.upload_hits =0; // to display a confirmation panel.

  tp.data.server_directory = new ReactiveVar([]);
  tp.data.local_directory = new ReactiveVar([]);
  tp.data.upload_count = new ReactiveVar(0);
  /*
       Was unable to pass that list in tp.state.err_list
  */
  tp.err_list =[];
  tp.state.set('err-list-timeStamp', new Date());

});

TP.onRendered(function(){
  const tp = this;
//  tp.btn_validate = tp.find('input.js-validate'); // NO-SPACES
  tp.btn_select = tp.find('input.js-select'); // NO-SPACES
  tp.btn_upload = tp.find('input.js-upload'); // NO-SPACES
  tp.btn_rsync = tp.find('input.js-rsync'); // NO-SPACES
  tp.btn_cancel = tp.find('input.js-cancel'); // NO-SPACES
  tp.div_prompt = tp.find('div.js-prompt'); // NO-SPACES
  tp.fileInput = tp.find('input[type=file]')

  tp.div_preflight = tp.find('div.js-preflight'); // NO-SPACES

  // 2xspaces - dots
//  tp.div_vtab1 = tp.find('div.js-vtab1'); // NO-SPACES
  tp.btn_show1 = tp.find('input.js-print1')

  tp.vtab_upload = tp.find('div.js-vtab-upload'); // NO-SPACES
  tp.vtab_confirm = tp.find('div.js-vtab-confirm'); // NO-SPACES
  tp.vtab_rsync = tp.find('div.js-vtab-rsync'); // NO-SPACES

  tp.show1 = tp.find('input.js-print1'); // NO-SPACES
  tp.show2 = tp.find('input.js-print2'); // NO-SPACES
  tp.show3 = tp.find('input.js-print3'); // NO-SPACES

  tp.reset_state = function(){
    tp.server ={};
    tp.batch =[];
    tp.errors =[];
    tp.warnings =[];
    tp.upload_hits =0; // to display a confirmation panel.

    tp.state.set('err-list-timeStamp', new Date());
    tp.state.set('warnings-count', 0) // not following guide lines.
    tp.state.set('errors-count', 0);
    tp.state.set('errors', []);
    tp.state.set('count', 0);
    tp.state.set('nfiles-server', 0);
    tp.state.set('nfiles-local', 0);
    tp.state.set('nv-count', 0);
    tp.state.set('err-comment', null);
    tp.state.set('prompt-style','');
    tp.state.set('prompt','Select the folder you want to sync with the server.');
//    tp.btn_validate.disabled = true;

    tp.btn_select.disabled = false;
    tp.btn_upload.disabled = true;
    tp.btn_rsync.disabled = true;
    tp.btn_cancel.disabled = true;
    tp.div_prompt.classList.remove('prompt-alert')
    tp.upload_hits =0; // for upload-confirmation
    tp.fileInput.value ='';
    /*
      those will be seen by children.
    */
    tp.data.server_directory.set([]);
    tp.data.local_directory.set([]);
    tp.data.upload_count.set(0); // for upload_reset.
    /*
         Was unable to pass that list in tp.state.err_list
    */
    tp.err_list =[];
    tp.state.set('err-list-timeStamp', new Date());
    tp.div_preflight.classList.add('nodisplay')
    tp.vtab_upload.classList.add('nodisplay')
    tp.vtab_confirm.classList.add('nodisplay')
    tp.vtab_rsync.classList.add('nodisplay')

  }

  tp.reset_state();
});

TP.helpers({
  state(x) {return Template.instance().state.get(x)},
  err_list() {
    const tp = Template.instance();
    const x = tp.state.get('err-list-timeStamp');
//    console.log('helper:',tp.err_list);
    return tp.err_list;
  }
})


TP.events({
  'click .js-select-directory': (e,tp)=>{
    tp.reset_state(); // q0.
  },
});

TP.events({
  'change .js-select-directory': async (e,tp)=>{ // => q1
    verbose && console.log(e);
    // activate "validation button"
    /*
        ALSO: to be considered : empty folder.
        IF THE FOLDER IS EMPTY NOTHING TO UPLOAD.
        MORE: there is no change-events.
    */
    if (tp.fileInput.files.length <=0) {
      console.log("empty:",tp.fileInput)
      throw 'NOTHING TO UPLOAD';
    }

    tp.upload_hits =0;
    tp.div_preflight.classList.add('nodisplay')

    tp.vtab_upload.classList.add('nodisplay')
    tp.vtab_confirm.classList.add('nodisplay')
    tp.vtab_rsync.classList.add('nodisplay')
    /*
        ATTN: fileInput.files is A NASTY OBJECT -- not a real array...
    */
    const files = [];
    for (let ix=0; ix<tp.fileInput.files.length; ix++) {
      const file = tp.fileInput.files[ix];
//      console.log(`--filtering <${file.webkitRelativePath}> file:`,file);
      const x = file.webkitRelativePath.match(/\.upload\/([a-z]*)\.yaml$/g);
      if (x != null) continue;
//      console.log(`--filtering <${file.webkitRelativePath}>`);
      files.push(file);
    }
//    tp.fileInput.files.filter(file=>{
//      return true;
//    });
    if (!files || files.length <=0) {
      tp.state.set('prompt', 'This folder is empty.');
      return;
    }

    // verbose && console.log(`local-directory:`,files)
    /*
        Analyse-validate a folder, It does not need to be folder on server.
    */

    //tp.state.set('nfiles-local',files.length);

    /*
        get dirname from first file,
        and download folder-directory
    */

    const file = files[0];
    if (!file) {
      tp.reset_state();
      return false;
    }



    let { type, name, webkitRelativePath } = file;
    //const vp = webkitRelativePath.split(path.sep);
    tp.state.set('prompt', 'please wait...');
//    console.log(`nfiles-local:${tp.state.get('nfiles-local')}`);

    const yaml_config = await get_yaml_config(tp.fileInput.files); // give the array.
//    const {target_folder} = yaml_config;
//    console.log(yaml_config);
//    console.log(`target_folder:`,target_folder);

    const target_folder = yaml_config['target-folder']
    || yaml_config.target_folder
    || webkitRelativePath.split(path.sep)[0];

    Meteor.call('assets-folder-directory', target_folder, async (err, res) => {
      if(err) {
        console.log('err:',err)
        switch(err.error) {
          case 'invalid-folder':
            tp.state.set('prompt',`the folder selected <${target_folder}> does not exists on the server.`);
//            tp.state.set('prompt-style','prompt-alert');
            tp.div_prompt.classList.add('prompt-alert')
            tp.state.set('nfiles-server',0);
            break
          default:
            tp.state.set('prompt',err.reason)
            break;
        }
        return;

        tp.state.set('prompt',err.reason)
        return;
      }
//          alert(`sucesso! ${res}`)
      console.log(`assets-folder-directory (server)size:${res.length} <${target_folder}> accepted res:`,res);
      let nfiles_server =0;
      const fmt = new Intl.DateTimeFormat('fr');
      var offset = new Date().getTimezoneOffset();
      var localOffset = new Date().getTimezoneOffset() * 60000;
      verbose && console.log('offet:',offset)
      res.forEach(file=>{
//        console.log(`server timeStamp:${+file.lastModified} => ${new Date(+file.lastModified)} <> ${new Date(+file.lastModified).toLocaleString("fr")}`)
//        console.log(`server timeStamp:${+file.lastModified} => ${new Date(+file.lastModified)} <> ${fmt.format(file.lastModified)}`)
//        console.log(`server timeStamp:${+file.lastModified} => ${new Date(+file.lastModified)} <> ${(new Date(+file.lastModified)).toISOString().split('T')[0]}`)
//        console.log(`server timeStamp:${+file.lastModified} => ${new Date(+file.lastModified)} <> ${(new Date(+file.lastModified)).toISOString()}`)
//        console.log(`server timeStamp:${+file.lastModified} => ${new Date(+file.lastModified)} <> ${(new Date(+file.lastModified-localOffset))}`)
        tp.server[file.name] = file;
        if (file.name.startsWith('.config.')) {
          flags_add(file,'ignore')
        } else {
          nfiles_server ++;
        }
      })

      /*
          Now, that we have remote and local we can evaluate the situation.
      */

      // console.log(`remote-directory:`,tp.server)
//      if (Object.keys(tp.server).length <=0) throw 'fatal-@135 remote-directory not ready'
      if (!Array.isArray(Object.keys(tp.server))) throw 'fatal-@135 remote-directory not ready'
      const {nfiles, errors, warnings, batch} = local_directory_check(tp.server,files)

      tp.errors = errors;
      tp.warnings = warnings;
      tp.batch = batch;
      tp.state.set('nfiles-local',nfiles)
      tp.state.set('nfiles-batch', batch.length) // this enables the upload button
      tp.state.set('nfiles-errors', errors.length) // this enables the upload button

      tp.state.set('v1-count', errors.filter(it=>(has_flag(it,'double-spaces')||has_flag(it,'extra-dots'))).length)
      tp.state.set('v2-count', warnings.filter(it=>(has_flag(it,'near-collision'))).length)
      tp.state.set('v3-count', errors.filter(it=>(has_flag(it,'collision'))).length)


      tp.state.set('nfiles-server',nfiles_server);
//      console.log('nfiles-server res:',res);
//      console.log(`nfiles-server:${tp.state.get('nfiles-server')} tp.server:`,tp.server);
      console.log(`nfiles-server:${tp.state.get('nfiles-server')}`);
//      tp.btn_validate.disabled = false;
      tp.btn_cancel.disabled = false;
      tp.btn_upload.disabled = false;
      tp.btn_select.disabled = true;

      tp.state.set('prompt','proceed with upload.')
//      tp.div_prompt.classList.remove('prompt-alert')
      tp.div_preflight.classList.remove('nodisplay')
    }); // call asset-folder-directory
  },
});

// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------

TP.events({
  'click .js-print': (e,tp)=>{
    const blist = tp.findAll('.js-print');
    console.log(`>click.js-print found btn:${blist.length}`)

    // reset all buttons except this one. and clear the print-area

    tp.err_list =[];
    tp.state.set('err-list-timeStamp', new Date());
    tp.data.server_directory.set([])
    tp.data.local_directory.set([])


    blist.forEach(btn =>{
//      console.log(`e.target:`,e.target)
//      console.log(`js-print:`,btn)
      if (btn == e.target) {
        btn.value = (btn.value == 'hide')? 'show':'hide';
        if (btn.value == 'show') {
//          e.preventDefault()
//          e.stopPropagation()
          e.stopImmediatePropagation()
        }
      } else {
        btn.value = 'show';
      }
    })
  }
});


TP.events({
  'click .js-print1': (e,tp)=>{
    console.log(`>click.js-print1`)
    tp.err_list = tp.errors.filter(file=>{
//      console.log(`filter file:`,file)
      if (file.flags) file.flags_ = Array.from(file.flags);
      return (has_flag(file,'double-spaces')||has_flag(file,'extra-dots'));
    })
    tp.state.set('err-list-timeStamp', new Date());
  },

  'click .js-print2': (e,tp)=>{
    console.log(`>click.js-print2`)
//    if (e.target.value == '')
    tp.err_list = tp.warnings.filter(file=>{
      if (file.flags) file.flags_ = Array.from(file.flags);
      return (has_flag(file,'near-collision'));
    })
    tp.state.set('err-list-timeStamp', new Date());
  },

  'click .js-print3': (e,tp)=>{
    console.log(`>click.js-print3`)
    tp.err_list = tp.errors.filter(file=>{
      if (file.flags) file.flags_ = Array.from(file.flags);
      return (has_flag(file,'collision'));
    })
    tp.state.set('err-list-timeStamp', new Date());
  },

  'click .js-print4': (e,tp)=>{
    console.log(`>click.js-print4`)
    const files = tp.fileInput.files;
//    tp.err_list = [];
    for (let ix=0; ix<files.length; ix++) {
      const file = files[ix];
      if (file.flags) {
        tp.err_list.push(file);
        file.flags_ = Array.from(file.flags);
      }
    }
    tp.state.set('err-list-timeStamp', new Date());
  },

  // server-directory
  'click .js-print5': (e,tp)=>{
    console.log(`>click.js-print5`)
    tp.state.set('err-list-timeStamp', new Date());

    tp.data.server_directory.set(Object.values(tp.server)
                .filter(file=>(!file.name.startsWith('.config.')))
                .sort((a,b)=>{
                  _assert(a.name,a,'fatal webKitRelativePath')
                  _assert(b.name,b,'fatal webKitRelativePath')
                  return (a.name.localeCompare(b.name));
                }));
  },

  // local-directory
  'click .js-print6': (e,tp)=>{
    console.log(`>click.js-print6`)
    tp.state.set('err-list-timeStamp', new Date());

    tp.data.local_directory.set(Object.values(tp.fileInput.files).filter(file=>(!file.name.startsWith('.config.'))))
  },

  // batch - ready to be uploaded
  'click .js-print7': (e,tp)=>{
    console.log(`>click.js-print7`)
    tp.state.set('err-list-timeStamp', new Date());

    tp.data.local_directory.set(tp.batch.sort((a,b)=>(a.webkitRelativePath.localeCompare(b.webkitRelativePath))));
  },

});


//-----------------------------------------------------------------------------
/*
    Also prep for rsync:
    - set a flag for each file visited.
*/
//-----------------------------------------------------------------------------

TP.events({
  'click .js-confirm-upload': (e,tp)=>{
    tp.upload_hits ++;
    tp.state.set('confirm-upload', false); // for what ?
    tp.vtab_confirm.classList.add('nodisplay')
  },
});

// ---------------------------------------------------------------------------


TP.events({
  'click .js-upload': async (e,tp)=>{
    e.preventDefault();
    //const fileInput = tp.find('input[type=file]')
//    const files = tp.fileInput.files;
    const files = tp.batch;
    const log =[];
    const uploaded =[];
    const uptodate =[];

    _assert(files, tp.batch, 'fatal-@386 no files to upload.')

    tp.upload_hits ++;
    if (tp.upload_hits <=1) {
      if ((tp.errors.length >0)
      || (tp.warnings.length >0)) {
        tp.state.set('confirm-upload', true);
        tp.vtab_confirm.classList.remove('nodisplay')
        tp.state.set('preflight-errors-count', tp.errors.length)
        tp.state.set('preflight-warnings-count', tp.warnings.length)
        return false;
      }
      tp.state.set('confirm-upload', false);
    }
    tp.vtab_confirm.classList.add('nodisplay')


    function has_flag(file,s) {
      return file.flags && file.flags.has(s)
    }

//    console.log(`Uploading local folder <${tp.state.get('upload-folder')}>`);
//      tp.nfiles.set(files.length)

//    console.log(`files:${files.length}`,files);
    tp.vtab_upload.classList.remove('nodisplay')

//    console.log('tp.server:',tp.server)

    let aCount =0; // alerts
    tp.state.set('alert-count',aCount);

//    let uCount =0;tp.state.set('upload-count',uCount);
//    let todateCount =0; tp.state.set('todate-count',todateCount);
    tp.state.set('upload-count',uploaded.length);
    tp.state.set('uptodate-count',uptodate.length);

    let errCount =0;
    tp.state.set('prompt', `Uploading...`);
    /*
      swap reset/cancel button
    */

    for (let ix=0; ix<files.length; ix++) {
      const file = files[ix];
      if (file.name.startsWith('.config.')) {
        continue;
      }

      /*
      if (file.flags) {
        ['ignore', 'error', 'fatal',
        //'warning'
        ].forEach(flag =>{
          if (file.flags.has(flag)) {
            console.log(`ALERT file ignored : <${file.webkitRelativePath}> flagged:`,file.flags);
          }
          file.flags.add('ignore')
        }) // each flag
        if (file.flags.has('ignore')) {
          continue; // means ignore. do-not upload.
        }
      }*/

      /*
        flag this file as 'visited', will be used later to remove files from server.
      */

      if (tp.server[file.name]) {
        tp.server[file.name].visited =true;
      }
      /*
        error-flag is set by validation, according to configuration file.
      */

//      console.log(`candidate for upload <${file.webkitRelativePath}> file:`,file);
      if (tp.server[file.name]) {
        const {mtime, size} = tp.server[file.name];

        _assert(file.lastModified, file, 'fatal-@372 Missing lastModified')
        _assert(tp.server[file.name].mtime, tp.server[file.name], 'fatal-@374 Missing lastModified')
        _assert(tp.server[file.name].mtimeMs, tp.server[file.name], 'fatal-@374 Missing lastModified')

        if ((file.lastModified == tp.server[file.name].lastModified)
          && (file.size == size)) {
            console.log(`QUICK-CHECK for <${file.name}> same-same => continue;`);
            continue;
          }


//        if (file.lastModified < tp.server[file.name].mtimeMs)
        if (file.lastModified < tp.server[file.name].lastModified)
        {
//          console.log(`ALERT file.mtime:${file.lastModified}  OLDER >> server.mtimeMs:${tp.server[file.name].mtimeMs}`)
          console.log(`ALERT file.mtime:${file.lastModified}  OLDER >> server.mtimeMs:${tp.server[file.name].lastModified}`)
          console.log(`ALERT file.mtime:${file.lastModifiedDate} OLDER >> server mtime:${tp.server[file.name].mtime}`)
          if (false) {
            // force-update
            errCount ++
            log.push({
              opCode: 'warning-date',
              fn: file.name,
              server_checksum: file.checksum,
              local_checksum: retv.checksum,
              server_time: tp.server[file.name].lastModifiedDate,
              local_time: new Date(file.lastModified),
            })
            tp.errors.push({
              level: 2,
              fn: file.webkitRelativePath,
              code: `local-file (${file.lastModifiedDate}) older than server (${tp.server[file.name].mtime})`
            });
            continue;
          }
        }

        _assert(!file.checksum, file, 'fatal-@268 why-checksum-here.')
        file.checksum = tp.server[file.name].checksum;

        if (file.lastModified != tp.server[file.name].lastModified) {
          console.log(`forcing upload when date don't match. file:${file.name}`)
          console.log(`forcing upload local-file: ${file.lastModified} [${file.lastModifiedDate}]`)
          console.log(`forcing upload server: ${tp.server[file.name].lastModified} [${new Date(tp.server[file.name].lastModified)}]`)
          file.checksum = "**3.14-trick**"+new Date().getTime(); // this will force upload.
        }

        let verbose =1;
        if (verbose) {
          console.log(`About to call upload_file:
            file.name: <${file.name}>
            file.lastModified: ${file.lastModified} <==> (server):${tp.server[file.name].lastModified}
            file.size: ${file.size} <==> (server):${tp.server[file.name].size}
            file.checksum: [${file.checksum}] <==> (server): [${tp.server[file.name].checksum}]
            file.flags: [${file.flags && Array.from(file.flags).join(' | ')}]
            `)
        }

        tp.data.upload_count.set(ix);
        await upload_file(file); // will upload only if checksum do not match.
        if (file.status != 'committed') {
          console.log('Not able to commit file:',file)
          break;
        }
        if (file.checksum == tp.server[file.name].checksum) {
          // unchanged.
          console.log(`file <${file.name}> NO-COMMIT : already up-to-date (checksum:${file.checksum}) unchanged.`)
          uptodate.push(file); tp.state.set('uptodate-count', uptodate.length);
          log.push({
            opCode: 'up-to-date',
            fn: file.name,
            server_checksum: tp.server[file.name].checksum,
            local_checksum: file.checksum,
            server_time: tp.server[file.name].lastModifiedDate,
            local_time: new Date(file.lastModified),
          })
          _assert(file.status == 'up-to-date', file, 'fatal-@446')
        } else {
//          _assert(file.status == 'committed', file, 'fatal-@447')
          uploaded.push(file);
          tp.state.set('upload-count', uploaded.length);
          log.push({
            opCode: 'commit',
            fn: file.name,
            server_checksum: tp.server[file.name].checksum,
            local_checksum: file.checksum,
            server_time: tp.server[file.name].lastModifiedDate,
            local_time: new Date(file.lastModified),
          })
        }
        continue;
      }

// todo: some cleanup here.

      await upload_file(file);
      console.log(`upload-file ${file.name} returned status:${file.status}`)
      if (file.status == 'committed') {
        tp.state.set('upload-count', uploaded.length);
      } else {
        console.log(`file.status <${file.name}>:`,file)
        break; // do not send more files
      }
      uploaded.push(file); tp.state.set('upload-count', uploaded.length);
      log.push({
        opCode: 'commit',
        fn: file.name,
        local_checksum: file.checksum,
        local_time: new Date(file.lastModified),
      })
    } // each local-file.

    let nv_Count =0; // not visited.
    Object.keys(tp.server).forEach(fn=>{
      if (!tp.server[fn].visited && !has_flag(tp.server[fn],'ignore')) nv_Count ++;
    })
    tp.state.set('nv-count', nv_Count);
    tp.vtab_rsync.classList.remove('nodisplay')

    tp.btn_upload.disabled = true;
    tp.btn_cancel.disabled = false; // change to reset.
    tp.state.set('prompt',`${tp.state.get('upload-count')} files were uploaded.`);
    /*

      hide print-panel

    */
    tp.err_list =[];
    tp.state.set('err-list-timeStamp', new Date());

    /*
        Report:
    */
    if (false) {
      log.forEach(it=>{
        console.log(`--log opCode:"${it.opCode}" fn:<${it.fn}>`)
        console.log(`      (local)  --checksum:${it.local_checksum} --local:${it.local_time}`)
        if (it.server_checksum || it.server_time)
        console.log(`      (server) --checksum:${it.server_checksum} --local:${it.server_time}`)
      })
    }

    return false;
  },
});

// ---------------------------------------------------------------------------

/*

    for now, only used to remove files on server.
    - for each local file, set a flag on tp.server
    - then each tp.server file with flag is removed from server.
    - list of candidates to remove is computed when leaving udate.
*/

TP.events({
  'click .js-rsync': async (e,tp)=>{
    e.preventDefault();
//    if (tp.state.get('nv-count') >0) disabled = false
    tp.btn_rsync.disabled = (tp.state.get('nv-count') <0);
    //const fileInput = tp.find('input[type=file]')
    const files = tp.fileInput.files;
    console.log(`RSYNC folder <${tp.state.get('upload-folder')}>`);

    let del_Count =0;
    Object.keys(tp.server).forEach(fn=>{
      if (!tp.server[fn].visited) {
        remove_from_server(tp.server[fn]);
        del_Count ++;
      }
    })
    tp.state.set('removed-count',del_Count);
    tp.btn_rsync.disabled = true;
    tp.state.set('prompt',`${del_Count} files were removed from server.`);
  }
});

function remove_from_server(file) {
  console.log(`remove_from_server file:`,file)
}

// ---------------------------------------------------------------------------

/*
    context sensitive:
*/

TP.events({
  'click .js-cancel': (e,tp)=>{
    tp.reset_state();
//    tp.skip1.checked = false;
    //const fileInput = tp.find('input[type=file]')
    tp.fileInput.value ='';
  }
});

// ---------------------------------------------------------------------------

FlowRouter.route('/upload', {
  name: 'upload',
  action: function(params, queryParams){
    console.log('Router::action for: ', FlowRouter.getRouteName());
    console.log(' --- params:',params);
//        document.auteur = "Museum v9";
//        app.article_id.set(undefined);
    BlazeLayout.render('upload');
  }
});

// ---------------------------------------------------------------------------

/*
    TO FORCE UPLOAD, the caller should set file.checksum := 'funny-checksum-3.14'
*/

const fileReaderStream = require('filereader-stream');
//const request = require('request');


async function upload_file(file, force_upload=false) {
  console.log(`Entering upload_file(${file.name}) flags:`,file.flags)
  let { type, name, webkitRelativePath} = file;
  const dirname = path.dirname(webkitRelativePath);
  //      const vp = OS.Path.split(webkitRelativePath);
  // server only.  const concat = require('concat-stream');

  var formData = new FormData();
  formData.append("size", file.size);
  formData.append('webkitRelativePath', file.webkitRelativePath)
  formData.append('checksum','3.1416');
  formData.append('afile',file,file.name); // LAST POSITION : need relativePath
//  formData.append('file2',fileReaderStream(file),file.name);

  return new Promise((resolve,reject)=>{
    fetch(`/gateway/${file.name}`, {
      method: "POST",
      // DO NOT USE HEADER..................................
      // headers: {'Content-Type' : 'multipart/form-data'},
      //    body: fileReaderStream(file)
      body: formData
    }).then(function(response) {
      if (response.status == 200) {
        file.status = 'committed';
        resolve(file);
      } else {
        console.log('response:',response);
        file.status = 'commit-failed'
        file.error = 'directory-not-found'
        resolve(file);
//        throw 'fatal-@668';
        return;
      }
      console.log('response:',response)
    }).catch(function(err) {
      console.log('err:',err)
      reject(err);
      throw 'fatal-@668';
    });
  })


return ;

//  const formData = new FormData();
  formData.append("userfile", file);
  formData.append("username", "Groucho");
  formData.append("accountnum", 123456);
  formData.append("userfile", file);
  const request = new XMLHttpRequest();
  request.open("POST", "http://localhost:3000/gateway/abc");
  request.send(formData);

return;


request.post({
  headers: {'content-type' : 'multipart/form-data'},
  url:`http://localhost:3000/gateway/abc`,
  formData: {
    'image': fileReaderStream(file)
  }
}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});

return;



//  const formData = new FormData();
  formData.append("userfile", file);
  formData.append("username", "Groucho");
  formData.append("accountnum", 123456);
//  request.post({url:`http://localhost:3000/gateway/${file.name}`, formData:formData});

  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:`http://localhost:3000/gateway/abc`,
    form:formData
  }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:', body);
  });

return;

  return new Promise((resolve,reject)=>{
    const r = fileReaderStream(file)
    .pipe(request.post(`http://localhost:3000/gateway/${file.name}`,{
      timeout:1500
    },function(error,response,body){
      console.log('XXXXXXXXXXXXXXXXXXXXXX',{error,response,body})
      if (error) {
        reject(error); return;
      }
      console.log({response,body})
    }));
    console.log(`resolve <${file.name}> r:`,r);
//    resolve(r)
  });
return;

fileReaderStream(file).pipe({
  on: function(x){console.log('on:',x)},
  once: function(x){console.log('once:',x)},
  write: function(x){console.log('write.length:',x.length)},
  emit: function(x){console.log('emit:',x)},
  end: function(x){console.log('end:',x)},
});

  fileReaderStream(file).pipe(concat(function(contents) {
        // contents is the contents of the entire file
        console.log(`contents.length:`,contents.length)
      }))

  let reader = new FileReader();

  return new Promise((resolve,reject)=>{
    const etime = new Date().getTime();

    /*
    reader.onload = function(evt) {
      console.log(evt.target.result);
    };*/

    // reader.addEventListener('load', ()=>{});
    reader.onloadend = function(evt) {
      console.log();
//      let buffer = new Uint8Array(reader.result)
      let buffer = reader.result;
      console.log(`It took ${new Date().getTime() -etime}ms. to read file <${file.name}>`)

      /*
      const checksum = hash(buffer, {algorithm: 'md5', encoding: 'base64' }) // goes int cr_revision.
      console.log(`It took ${new Date().getTime() -etime}ms. to read file <${file.name}> and checksum`)

      // file.checksum is checksum comming from server.... ATTN.
      if (checksum == file.checksum) {
        resolve(Object.assign(file,{
          status: 'up-to-date',
          checksum
        }));
        return; // IMPORTANT.
      }
      */

      // we need cloning -because File is tricky.
      const _file = { // this is cloning
        name: file.name,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        size: file.size,
        type: file.type,
        webkitRelativePath: file.webkitRelativePath,
//        checksum
//        buffer: reader.result
      }

//      Meteor.call('upload-file', { name, type, buffer, webkitRelativePath}, (err, res) => {

      console.log(`call:upload-file <${_file.name}>`);
      Meteor.call('upload-file', _file, buffer, (err, res) => {
        if(err) {
          console.log('upload-file err:',err)
          reject('fatal-error');
        } //throw err
  //          alert(`sucesso! ${res}`)
//        tp.count.set(ix+1)
        console.log(`<${_file.webkitRelativePath}> sent/Ok.`)
        // Now we don't need the cloned object.
        Object.assign(file, {status:'committed'})
        resolve(file);
      });
    };

//    reader.readAsArrayBuffer(file)
    reader.readAsBinaryString(file);
  })
}; // upload-file


TP.helpers({
  localTime(timeStamp) {
    return new Date(+timeStamp)
  }
})
