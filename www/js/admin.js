//Centre of RHS map in pdf is roughly: 
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

});