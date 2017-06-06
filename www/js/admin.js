var createFile = function(filename){
  window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
    console.log('file system open: ' + fs.name);
    openFile(fs.root, filename, false);
  }, function(e){ console.log("Error loading filesystem "+e); });
};

var openFile = function(dirEntry, fileName, isAppend) {
  dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
    writeFile(fileEntry, null, isAppend);
  }, function(e){ console.log("Error loading filesystem "+e); });
};

var writeFile = function(fileEntry, dataObj) {
  fileEntry.createWriter(function (fileWriter) {

    fileWriter.onwriteend = function() {
      console.log("Successful file write...");
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
