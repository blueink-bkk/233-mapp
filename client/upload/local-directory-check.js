import {app, nor_fn1, _assert} from '../app-client.js';

/*

  for each file :
    - if file exists on server : (DONE BEFORE)
      - set flag "visited"
      - if different size => mark for upload
      - if date doesn't match => set a warning
      - if close-match => reject (case)
    - if file does not exist on server (new file)
      - if double-spaces, extra-dots, illegal character => reject
      - if not dash-alpha-numeric => warning.
      - if near-collision with another new-file => reject

*/



export function local_directory_check(remote_dir, files) {
  console.log(`Entering validate_local_directory`)
  // console.log('remote-dir:',remote_dir)
  const verbose = 0;
  const errors =[];   // new files only
  const warnings =[]; // new files and date-no-match
  const batch =[];    // list of files to push.
  let nfiles =0; // number of files in local folder (config excluded)
  let new_Count =0;
  const hh = {}; // NEW FILES ONLY : to detect collisions, near-collisions from new files.

  if (!remote_dir || !Array.isArray(Object.keys(remote_dir))) throw 'fatal-@30. remote-dir corrupted'

  if (true) {
    // test
    const key1 = Object.keys(remote_dir)[0];
    _assert(remote_dir[key1], key1, `fatal-@33.`)
  }


  let leg1 = null;
  for (let ix=0; ix<files.length; ix++) {
    const file = files[ix];
    /*
        webkitRelativePath contains the folder searched.....
        the first file will give us the first leg.
    */
    if (!leg1) {
      leg1 = file.webkitRelativePath.split('/')[0];
    }
    _assert(leg1, file.webkitRelativePath, 'fatal-@39.')

    const filename = file.webkitRelativePath.replace(leg1,'');

    _assert (!filename.startsWith('museum-pub'), file, 'fatal-@33');

    verbose && console.log(`-- checking <${filename}>`)
    if (has_flag(file,'ignore')) {
      verbose && console.log(`-- ignore <${filename}>`)
      continue; // done earlier
    }
    reject_config_files(file);
    nfiles ++; // exclude config

    const remote = remote_dir[filename]
//    verbose && console.log(`-- remote <${filename}> :`,remote)
    if (remote) {
      add_flag(remote,'visited')

      if (file.size != remote.size) {
        add_flag(remote,'dirty')
        add_flag(file,'send')
        verbose && console.log(`size-change for <${filename}> remote:${remote.size} local:${file.size}`)
        batch.push(file)
        verbose && console.log(`batch:${batch.length} update:<${file.name}>`)
        continue;
      }
      if (file.lastModified != remote.lastModified) {
        add_flag(remote,'dirty')
        add_flag(file,'warning')
        add_com(file,`local file time ${file.lastModified} older than time on remote file: ${file.lastModified}`)
//        verbose && console.log(`-- change-time for <${filename}>`)
        continue;
      }

      // here the local-file is sync with remote-file.
      // note:  nfiles - batch.length => gives the number of local files not to push.
      continue;
    } // file was found on remote


    /*
        HERE ONLY NEW FILES
    */

    new_Count ++;
    add_flag(file,'new-file')

    verbose && console.log(`-- new file <${filename}>`)
    const nf = nor_fn1(filename)
    hh[nf] = hh[nf] || [];
    hh[nf].push(file);

    if (remote_dir[nf]) {
      /*
        the local file-name is different but too close from remote name.
      */
      add_flag(file,'rejected')
      add_com(file,`close-match local:${filename} nor=> server:${nf}`)
    }


    /*
        V1: double spaces
    */

    const nf1 = filename.replace(/\s+/g,' ');
    if (nf1.length != filename.length) {
      add_flag(file,'double-spaces')
      add_flag(file,'rejected')
//      errors.push(file)
      add_com(file,`double-spaces:<${filename.replace(/\s{2,}/g,'**')}>`)
    }
    /*
        V2: extra-dots
    */

    const vdots = filename.split('.');
    if (vdots.length !=2) {
      add_flag(file,'extra-dots')
      add_flag(file,'rejected')
//      errors.push(file)
      add_com(file,`found ${vdots.length-1} dots - only 1 is allowed`)
    }

    /*
        V3: illegal-characters => near-collision
    */

    const nf3 = filename.replace(/[\?\&\:\(\)\[\]\_]/g,'');
    if (nf3.length != filename.length) {
      add_flag(file,'illegal-characters')
      add_flag(file,'rejected')
//      errors.push(file)
      add_com(file,`illegal-characters:<${filename.replace(/[\?\&\:\(\)\[\]\_]/g,'**')}>`)
    }

  } // each file

  /*
      RECAP: HERE ONLY NEW FILES.
      existing file need to be pushed on batch....before
  */

  Object.keys(hh).forEach(nf =>{
    const files = hh[nf];
    hh[nf].forEach(file =>{
      if (hh[nf].length >1) {
        // we are in a group of near-collisions
        add_flag(file,'near-collision');
        add_flag(file,'rejected');
        add_com(file,`close-match nor-fn =>${nf}`)
        errors.push(file);
        verbose && console.log(`errors:${errors.length} error file:<${file.name}>`)
      } else {
        if (has_flag(file,'rejected')) {
          errors.push(file);
        } else {
          batch.push(file);
        }
        verbose && console.log(`batch:${batch.length} new file:<${file.name}> flags:`,file.flags)
      }
    })
  })


  console.log(`Leaving validate_directory
    local directory : ${nfiles} files
    files rejected : ${errors.length}
    warnings : ${warnings.length}
    batch : ${batch.length} file to commit/push
    `)

  return {
    nfiles, // excluding config files.

    errors,
    warnings,
    batch // list of file to commit/push on server.
  }
} // local_directory_check


function add_flag(file,flag) {
  file.flags = file.flags || new Set();
  file.flags.add(flag);
}

function has_flag(file,flag) {
  return file.flags && file.flags.has(flag)
}


function add_com(file,err) {
  file.com = file.com || [];
  file.com.push(err);
}



function reject_config_files(file) {
  _assert(!file.name.startsWith('.config.'), file, 'fatal-@133 config files are in sub-folder ./.upload');
  _assert(!file.webkitRelativePath.startsWith('.upload'), file, 'fatal-@136 config files are in sub-folder ./.upload');
}
