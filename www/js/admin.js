function showFile(filePath){
  console.log("adding a link");
  var a = document.createElement('a');
  a.textContent = 'Log file';
  a.href = filePath;
  a.id = "dlfile";
  document.body.appendChild(a);

  $('#dlfile').click(function(e){
    e.stopPropagation();
    window.open(filePath, '_system');
  });
};

var readFile = function(fileEntry) {
  fileEntry.file(function (file) {
    var reader = new FileReader();
    reader.onloadend = function() {
      console.log(file);
      showFile(file.localURL);
    };
    reader.readAsText(file);
  }, function(e){ console.log("Error reading file "+ e)});
};

var writeFile = function(fileEntry, dataObj) {
  fileEntry.createWriter(function(fileWriter) {

    fileWriter.onwriteend = function() {
      readFile(fileEntry);
    };

    fileWriter.onerror = function (e) {
      console.log("Failed file write: " + e.toString());
    };

    if (!dataObj) {
      dataObj = new Blob(['some file data\n', 'again some more data'], { type: 'text/csv' });
    }

    fileWriter.write(dataObj);
  });
};

var createFile = function(directory, filename, filedata){
  
  var openFile = function(dirEntry){
    console.log("dirEntry");
    console.log(dirEntry);

    dirEntry.getFile(filename, { create: true, exclusive: false },
      function (fileEntry) {
        console.log("fileEntry is file?" + fileEntry.isFile.toString());
        writeFile(fileEntry, null);
      },
      function(e){ 
        console.log("Error opening file"); 
    });
  };

  var getDirectory = function(fs){
    fs.root.getDirectory(directory, {create:true}, openFile, function(){ console.log("couldnt find directory"); });
  };

  window.resolveLocalFileSystemURL(directory, openFile);

  //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getDirectory, function(e){ console.log("Error getting filesystem "+e); });
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
    var dir = cordova.file.documentsDirectory;
    if (device.platform == "Android"){ dir = cordova.file.externalDataDirectory; }
    createFile(dir, 'logfile.csv');
    e.preventDefault();
  });

});