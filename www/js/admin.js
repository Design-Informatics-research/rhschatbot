var storageDir = '';

var addShareLink = function(i, fileEntry){
  var listItem = document.createElement('li');
  var link = document.createElement('a');

  link.textContent = fileEntry.name;
  link.href = '#logfile-'+i;
  link.id = 'logfile-'+i;
  listItem.appendChild(link);
  $('#logfiles').append(listItem);
    
  $('#'+link.id).click(function(){
    console.log(fileEntry.toURL());
    window.plugins.socialsharing.shareViaEmail(
      'See attached chatbot log.', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
      'RHSChatbot log: '+fileEntry.name,
      ['rgianni@ed.ac.uk'], // TO: must be null or an array
      null, // CC: must be null or an array
      null, // BCC: must be null or an array
      [fileEntry.toURL()], // FILES: can be null, a string, or an array
      function(){ console.log("yay"); }, // called when sharing worked, but also when the user cancelled sharing via email. On iOS, the callbacks' boolean result parameter is true when sharing worked, false if cancelled. On Android, this parameter is always true so it can't be used). See section "Notes about the successCallback" below.
      function(e){ console.log("nay: " + e); } // called when sh*t hits the fan
    );
  });
};

var listDir = function(path){
  $('#logfiles').empty();
  window.resolveLocalFileSystemURL(path,
    function (fileSystem) {
      var reader = fileSystem.createReader();
      reader.readEntries(
        function (entries) { $.each(entries, addShareLink); },
        function (err) { console.log(err); }
      );
    }, function (err) { console.log(err); }
  );
};

var readFile = function(fileEntry) {
  fileEntry.file(function (file) {
    var reader = new FileReader();
    reader.onloadend = function() {
      listDir(storageDir);
    };
    reader.readAsText(file);
  }, function(e){ console.log("Error reading file "+ e)});
};

var writeFile = function(fileEntry, fileData) {
  fileEntry.createWriter(function(fileWriter) {

    fileWriter.onwriteend = function() {
      readFile(fileEntry);
    };

    fileWriter.onerror = function (e) {
      console.log("Failed file write: " + e.toString());
    };

    if (!fileData) {
      fileData = new Blob(fileData, { type: 'text/csv' });
    }

    fileWriter.write(fileData);
  });
};

var createFile = function(directory, filename, fileData){
  
  var openFile = function(dirEntry){
    dirEntry.getFile(filename, { create: true, exclusive: false },
      function (fileEntry) {
        console.log("fileEntry is file?" + fileEntry.isFile.toString());
        writeFile(fileEntry, fileData);
      },
      function(e){ 
        console.log("Error opening file"); 
    });
  };

  var getDirectory = function(fs){
    fs.root.getDirectory(directory, {create:true}, openFile, function(){ console.log("couldnt find directory"); });
  };

  window.resolveLocalFileSystemURL(directory, openFile);
};

$(document).ready(function(){
  
  var onDeviceReady = function(){
    console.log('deviceready');
    $('#loadingMsg').hide();
    storageDir = cordova.file.documentsDirectory;
    if (device.platform == "Android"){ storageDir = cordova.file.externalDataDirectory; }
    listDir(storageDir);
  };

  var onResume = function(){
    console.log('onResume');
  };
  var onPause = function(){
    console.log('onPause');
  };

  //document.addEventListener('deviceready', onDeviceReady.bind(), false);
  setTimeout(onDeviceReady, 3000);
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
    chatbotDb.logs(function(rows){
      var csvStr = (["timestamp", "text", "origin", "originName", "latitude", "longitude", "accuracy", "heading", "speed", "locTimestamp"].join(",")+"\n");
      $.each(rows, function(idx, row){ 
        csvStr += ([row.timestamp, '"'+row.text+'"', row.origin, row.originName, row.latitude, row.longitude, row.accuracy, row.heading, row.speed, row.locTimestamp].join(",")+"\n");
      });
      createFile(storageDir, 'logfile-'+(new Date-0)+'.csv', csvStr);
    });

    e.preventDefault();
  });

});