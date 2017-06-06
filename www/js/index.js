//Centre of RHS map in pdf is roughly: 
//55.94120,-3.37396 (near top bit of main ring)
//0.0005 diff in latlng = around 30m

$(document).ready(function(){
  /*
  $('#sampleconvo').click(function(){
    if (!ChatBot.playConversation(sampleConversation,4000)) {alert('conversation already running');};
  });

  $('#options').click(function(){
    $('#chatBotCommandDescription').slideToggle();
  }); */

  setupChatBot();
  app.initialize();
});

var buildLocationString = function(position){
  return 'Latitude: '   + position.coords.latitude          + '\n' +
  'Longitude: '         + position.coords.longitude         + '\n' +
  'Altitude: '          + position.coords.altitude          + '\n' +
  'Accuracy: '          + position.coords.accuracy          + '\n' +
  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
  'Heading: '           + position.coords.heading           + '\n' +
  'Speed: '             + position.coords.speed             + '\n' +
  'Timestamp: '         + position.timestamp                + '\n';
};

var logPosition = function(position) {
  console.log(buildLocationString(position));
};

var positionError = function(error) {
  console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
};

var between = function(n, a, b) {
  return (n - a) * (n - b) <= 0
};

var sites = [{
  name: 'the sheep',
  latitude: 55.94121,
  longitude: -3.37395
}];

var checkNearSite = function(position){
  logPosition(position);
  //TODO Skip this if it's user's first time.
  var nearby = false;
  $.each(sites, function(idx, site){
    nearby = between(position.coords.latitude, site.latitude-0.0005, site.latitude+0.0005) &&
      between(position.coords.longitude, site.longitude-0.0005, site.longitude+0.0005);

    console.log(site.name + " - near: " + nearby);
    
    if (nearby){
      ChatBot.setAllowedPatterns(["confirm-location"]);
      ChatBot.addSetResponses(["Yes", "No"]);
      ChatBot.addChatEntry("Oh, it looks like you're near " + site.name + ", is that right?", "bot");
      return false;
    } else {
      return true;
    }
  });
};

var geolocationOptions = { maximumAge: 30000, timeout: 6000, enableHighAccuracy: true };

function onPicSuccess(imageURL) {
  ChatBot.addChatEntry('<img class="" src="'+imageURL+'" />',"human");
}

function onPicFail(message) {
  console.log('Failed because: ' + message);
}

function loadSavedChat(){
  chatbotDb.logs(function(rows){
    $.each(rows, function(i,entry){
      var entryDiv = ChatBot.addChatContent(entry.text,entry.origin);
      $(entryDiv).show();
      ChatBot.setOriginName(entry.origin, entry.originName);
    });
    setTimeout(function(){ $("html, body").animate({ scrollTop: $(document).height() }, "slow"); }, 500); 
  });

  chatbotDb.lastState(function(state){
    ChatBot.setAllowedPatterns(state.allowedPatterns);
    ChatBot.addSetResponses(state.setResponses);
  });
}

var app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    document.addEventListener("resume", this.onResume.bind(this), false);
    document.addEventListener("pause", this.onPause.bind(this), false);
  },

  onResume: function () {
    console.log('onresume');
    navigator.geolocation.getCurrentPosition(checkNearSite, positionError, geolocationOptions);
  },

  onPause: function () {
    console.log('onpause');
  },

  onDeviceReady: function() {
    console.log('deviceready');

    var latitude = 55.94120;
    var longitude = -3.37396;
    var accuracy = 1;
    var altitude = 0;

    mockGeolocation.setMock([latitude, longitude, accuracy, altitude], function(suc){
      console.log("Mocked location: ");
      console.log(suc);
    }, function(err){
      console.log("Error mocking location: ");
      console.log(err);
    });

    loadSavedChat();
  }
};

var setupChatBot = function(){
  var sampleConversation = ["Hi", "My name is Fry", "Where is China?", "What is the population of China?", "Bye"];

  var config = {
    botName: 'Duck Duck Go Bot',
    inputs: '#humanInput',
    sendBtns: '#send',
    inputCapabilityListing: true,
    engines: [ChatBot.Engines.duckduckgo()],

    addChatEntryCallback: function(entryDiv, text, origin) {
      entryDiv.delay(200).slideDown();
      setTimeout(function() { $("html, body").animate({ scrollTop: $(document).height() }, "slow"); }, 300);                  

      if (origin == "bot") {
        chatbotDb.saveState(ChatBot.getAllowedPatterns(), ChatBot.getSetResponses());
      }

      chatbotDb.insertLog(text, origin, ChatBot.getOriginName(origin));
      return false;
    }
  };

  ChatBot.init(config);
  
  ChatBot.setBotName("RHSBot");

  ChatBot.addPattern("^adminpanel$", "response", undefined, function(matches){
    window.location = "admin.html";
  });
  
  ChatBot.addPattern("compute ([0-9]+) plus ([0-9]+)", "response", undefined, function (matches) {
    ChatBot.addChatEntry("That would be "+(1*matches[1]+1*matches[2])+".","bot");
  },"Say 'compute [number] plus [number]' to make the bot your math monkey");

  ChatBot.addPattern("location", "response", undefined, function (matches) {
    navigator.geolocation.getCurrentPosition(function(position){ 
      ChatBot.addChatEntry(buildLocationString(position),"bot");
    }, positionError, geolocationOptions);    
  },"Say 'location' to check lat lng location");

  // Hi

  ChatBot.addPattern("^hi$", "response", undefined, 
    function (matches) { 
      ChatBot.addChatEntry("Hi there, what's your name?","bot");
    }, "Say 'hi' to get started.", undefined, ["name"]);

  // Start image capture
  ChatBot.addPattern("^picture$", "response", undefined, 
    function (matches) {
      ChatBot.addChatEntry("OK, take a picture!","bot");
      navigator.camera.getPicture(onPicSuccess, onPicFail, { quality: 50, saveToPhotoAlbum: true, destinationType: Camera.DestinationType.FILE_URI });
    });

  //Rory

  ChatBot.addPattern("(?:my name is|I'm|I am) (.*)", "response", "Hi $1, what are you planning to do today?", 
    function (matches) { ChatBot.setHumanName(matches[1]); },
    "Say 'My name is [your name]' or 'I am [name]' to be called that by the bot", "name", ["activity"]);

  //I'm going to see animals

  ChatBot.addPattern("(.*?)", "response", "Great, where are you going first?", 
    undefined, undefined, "activity", ["first-visit"]);

  // To the sheep.

  ChatBot.addPattern("(.*?)", "response", "OK, let me know when you get there!", 
    undefined, undefined, "first-visit", undefined);

  //End of thread.

  ChatBot.addPattern("(Yes|No)", "response", "OK - go and take a look!", 
    function (matches) {
      console.log("matches: "); console.log(matches);
    }, undefined, "confirm-location", undefined);

};

/*

TODO:

Fix sheep message interruption of thread 
Fix matching with new line values e.g. "My name \n is XYZ"
Fix my name is vs / <name> response
Fix non-scrolling / partially hidden responses (low priority)


Help button response
'Respond with picture' option
Convo content
Admin page / magic word
CSV download

*/