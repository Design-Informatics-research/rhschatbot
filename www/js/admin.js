function showFile(filePath){
  var a = document.createElement('a');
  a.textContent = 'My file';
  a.href = filePath;
  document.body.appendChild(a);
};

var readFile = function(fileEntry) {
  fileEntry.file(function (file) {
    var reader = new FileReader();
    reader.onloadend = function() {
      console.log(fileEntry.fullPath + ": " + this.result);
      showFile(fileEntry.fullPath);
    };
    reader.readAsText(file);
  }, function(e){ console.log("Error reading file "+ e)});
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

    if (!dataObj) {
      dataObj = new Blob(['some file data', 'again some more data'], { type: 'text/csv' });
    }

    fileWriter.write(dataObj);
  });
};

var createFile = function(filename, filedata){
  var openFile = function(fs){   
    fs.root.getFile(filename, { create: true, exclusive: false },
      function (fileEntry) {
        console.log("fileEntry is file?" + fileEntry.isFile.toString());
        writeFile(fileEntry, null);
      }, 
      function(e){ 
        console.log("Error opening file"); 
    });
  };

  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, openFile, function(e){ console.log("Error creating file "+e); });
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
