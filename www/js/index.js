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
  chatbotDb.printLogs();
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
      ChatBot.addChatEntry("Oh, it looks like you're near " + site.name + ", is that right?", "bot");
      ChatBot.setAllowedPatterns(["confirm-location"]);
      return false;
    } else {
      return true;
    }
  });
};

var geolocationOptions = { maximumAge: 30000, timeout: 6000, enableHighAccuracy: true };

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

    //navigator.geolocation.getCurrentPosition(logPosition, positionError, geolocationOptions);
  }
};

var setupChatBot = function(){
  var sampleConversation = ["Hi", "My name is Fry", "Where is China?", "What is the population of China?", "Bye"];

  var config = {
    botName: 'Duck Duck Go Bot',
    inputs: '#humanInput',
    inputCapabilityListing: true,
    engines: [ChatBot.Engines.duckduckgo()],

    addChatEntryCallback: function(entryDiv, text, origin) {
      entryDiv.delay(200).slideDown();
      $("html, body").animate({ scrollTop: $(document).height() }, "slow");
      chatbotDb.insertLog(text, origin);
      return false;
    }
  };

  ChatBot.init(config);
  
  ChatBot.setBotName("RHSBot");

  ChatBot.addPattern("^bye$", "response", "See you later buddy", undefined, "Say 'Bye' to end the conversation.");
  
  ChatBot.addPattern("(what is the )?meaning of life", "response", "42", undefined, "Say 'What is the meaning of life' to get the answer.");
  
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
      ChatBot.setAllowedPatterns(["name"]);
    }, "Say 'hi' to get started.");

  //Rory

  ChatBot.addPattern("(?:my name is|I'm|I am) (.*)", "response", "Hi $1, what are you planning to do today?", 
    function (matches) { 
      ChatBot.setHumanName(matches[1]);
      ChatBot.setAllowedPatterns(["activity"]);
    },
    "Say 'My name is [your name]' or 'I am [name]' to be called that by the bot", "name");

  //I'm going to see animals

  ChatBot.addPattern("(.*?)", "response", "Great, where are you going first?", 
    function (matches) { 
      ChatBot.setAllowedPatterns(["firstvisit"]);
    },
    undefined, "activity");

  // To the sheep.

  ChatBot.addPattern("(.*?)", "response", "OK, let me know when you get there!", 
    function (matches) { 
      ChatBot.setAllowedPatterns([]);
    },
    undefined, "firstvisit");

  //End of thread.

  ChatBot.addPattern("(yes|no)", "response", "OK - go and take a look!", 
    function (matches) {
      console.log("matches: "); console.log(matches);
      ChatBot.setAllowedPatterns([]);
    }, undefined, "confirm-location");
};