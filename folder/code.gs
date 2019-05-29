/* Get all the files within Folders and subfolders */

function code(){
   var folderId = "xxxxxxx";
   var parentFolder = DriveApp.getFolderById(folderId);
   var folderName = parentFolder.getName();

  try {  
    //get folder's files
    var files =parentFolder.getFiles();

    while (files.hasNext()) {
        var file = files.next();
        var fileId = file.getId();
        var fileName = file.getName();
        Logger.log(fileName);
    };
    
    getChildFolders(parentFolder);
    
  } catch (e) {    
     ui.alert("CAUGHT EXCEPTION " + e.toString());
  }  
}

// build the folder tree structure for traversal
function getChildFolders(parent) {
  var childFolders = parent.getFolders();
  
  while (childFolders.hasNext()) {    
    var childFolder = childFolders.next();
    var folderName = childFolder.getName();
    var folderId = childFolder.getId();

    //get folder's files
    var files =childFolder.getFiles();

    while (files.hasNext()) {
        var file = files.next();
        var fileId = file.getId();
        var fileName = file.getName();
    };
    
    // Recursive call for any sub-folders
    getChildFolders(childFolder);
    
  }
}
