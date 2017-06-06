var readFile = function(fileEntry) {
  fileEntry.file(function (file) {
    var reader = new FileReader();
    reader.onloadend = function() {
      console.log("Successful file read: " + this.result);
      displayFileData(fileEntry.fullPath + ": " + this.result);
    };
    reader.readAsText(file);
  }, function(e){ console.log("Error reading file "+ e)});
};

var createFile = function(filename){
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
    console.log('file system open: ' + fs.name);
    fs.root.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
      console.log("fileEntry is file?" + fileEntry.isFile.toString());
      writeFile(fileEntry, null);
    }, function(e){ console.log("Error creating file "+e); });
};

var writeFile = function(fileEntry, dataObj) {
  fileEntry.createWriter(function (fileWriter) {

    fileWriter.onwriteend = function() {
      console.log("Successful file write");
      readFile(fileEntry);
    };

    fileWriter.onerror = function (e) {
      console.log("Failed file write: " + e.toString());
    };

    // If data object is not passed in,
    // create a new Blob instead.
    if (!dataObj) {
      dataObj = new Blob(['some file data'], { type: 'text/plain' });
    }

    fileWriter.write(dataObj);
  });
};


$(document).ready(function(){

  var onDeviceReady = function(){
    console.log('deviceready');
  };

  var onResume = function(){
    console.log('onResume');
  };
  var onPause = function(){
    console.log('onPause');
  };

  document.addEventListener('deviceready', onDeviceReady.bind(), false);
  document.addEventListener("resume", onResume.bind(), false);
  document.addEventListener("pause", onPause.bind(), false);

  $('#clearLogs').click(function(e){
    e.stopPropagation();
    if (confirm("Do you want to clear the logs?")){ 
      chatbotDb.reset();
    }
   e.preventDefault();
  });

  $('#downloadLogs').click(function(e){
    createFile('hello.txt');
    e.preventDefault();
  });

});
