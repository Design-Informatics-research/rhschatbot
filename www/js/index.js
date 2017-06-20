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

var sites = [
  {
    name: 'E-Spark area',
    location: 'by the RBS Bank Branch near Ingliston House'
  },{
    name: 'Aberdeenshire Village',
    location: 'on 7th Avenue'
  },{
    name: 'Scotland\'s Larder Live',
    location: 'on 13th Avenue'
  }
];

var currentSite;
var sitesVisited = [];

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

var startChatting = function(){
  ChatBot.addChatEntry("Hi, I'm the RHSBot, I'll be helping you record your experiences at the Royal Highland Show today.", 'bot')
  ChatBot.addChatEntry("Let's get started. What's your name?", 'bot');
  ChatBot.setAllowedPatterns(["name"]);
};

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
    
    if (rows.length == 0){ 
      startChatting(); 
    } else {
      chatbotDb.lastState(function(state){
          ChatBot.setAllowedPatterns(state.allowedPatterns);
          ChatBot.addSetResponses(state.setResponses);
        });
    }

    setTimeout(function(){ $("html, body").animate({ scrollTop: $(document).height() }, "slow"); }, 500); 
  }); 
}

var app = {
  initialize: function() {
    chatbotDb.migrate();
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    document.addEventListener("resume", this.onResume.bind(this), false);
    document.addEventListener("pause", this.onPause.bind(this), false);
  },

  onResume: function () {
    console.log('onresume');
    //navigator.geolocation.getCurrentPosition(checkNearSite, positionError, geolocationOptions);
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

var nextSite = function(){
  if (sitesVisited.length == sites.length) {
    //no more sites
    ChatBot.addChatEntry("Great, thanks for helping with this study. Do you have any final thoughts about your experiences today?");
    ChatBot.addSetResponses("Yes I do", "No, I'm done");
  } else {
    $.each(sites, function(i,site){
      if (!(sitesVisited.includes(site.name))){ currentSite = site; return false; }
    });
    ChatBot.addChatEntry("Please visit " + currentSite.name + " " + currentSite.location + " and let me know when you get there","bot");
    ChatBot.addSetResponses(["I'm here", "I got distracted"]);
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

  ChatBot.addPatternObject({
    regexp: "^adminpanel$",
    callback: function(matches){ window.location = "admin.html"; },
    threadId: "adminpanel"
  });
  
  ChatBot.addPatternObject({
    regexp: "^location$",
    callback: function (matches) {
      navigator.geolocation.getCurrentPosition(function(position){
        ChatBot.addChatEntry(buildLocationString(position),"bot");
      }, positionError, geolocationOptions);    
    }
  });

  ChatBot.addPatternObject({
    regexp: "^picture$",
    callback: function (matches) {
      ChatBot.addChatEntry("OK, take a picture!","bot");
      navigator.camera.getPicture(onPicSuccess, onPicFail, { quality: 50, saveToPhotoAlbum: true, destinationType: Camera.DestinationType.FILE_URI });
    }
  });

  ChatBot.addPatternObject({
    regexp: "(?:(?:my name is|I'm|I am) (.*))|(.*)",
    callback: function (matches) {
      var name = matches[1];
      if (name == undefined){ name = matches[2]; }
      ChatBot.setHumanName(name);
      this.addChatEntry("Hi "+name+", what are you planning to do today?", "bot");
    },
    allowedPatterns: ["adminpanel", "activity"],
    threadId: "name"
  });

  //I'm going to see animals

  ChatBot.addPatternObject({
    regexp: "(.*?)",
    actionValue: "Great, where are you going first?",
    allowedPatterns: ["adminpanel", "first-visit"],
    threadId: "activity"
  });

  // To the sheep.

  ChatBot.addPatternObject({
    regexp: "(.*?)",
    actionValue: "OK, let me know when you get there!",
    callback: function(){ ChatBot.addSetResponses(["I'm here", "I got distracted"]); },
    allowedPatterns: ["adminpanel", "distracted", "arrived"],
    threadId: "first-visit"
  });

  //Distracted

  ChatBot.addPatternObject({
    regexp: "I got distracted",
    actionValue: "What's happening there? Take a picture and/or tell me about it.",
    callback: function(){ /* picture btn / result */ },
    allowedPatterns: ["adminpanel", "anything-else"],
    threadId: "distracted"
  });

  // I'm here

  ChatBot.addPatternObject({
    regexp: "I'm here",
    actionValue: "What's happening there? Take a picture and/or tell me about it.",
    callback: function(){ /* picture btn / result */ },
    allowedPatterns: ["adminpanel", "anything-else"],
    threadId: "arrived"
  });

  //<user experience>

  ChatBot.addPatternObject({
    regexp: "(.*?)",
    actionValue: "Anything else you'd like to add?",
    callback: function(){ ChatBot.addSetResponses(["Yes", "No"]); },
    allowedPatterns: ["adminpanel", "else-yes", "else-no"],
    threadId: "anything-else"
  });

  //Yes - more to add

  ChatBot.addPatternObject({
    regexp: "Yes",
    actionValue: "Oh? Take a picture and/or tell me about it.",
    callback: function(){ /* picture btn / result */ },
    allowedPatterns: ["adminpanel", "anything-else"],
    threadId: "else-yes"
  });

  //No - move on

  ChatBot.addPatternObject({
    regexp: "No",
    actionValue: "Thanks, let's move on.",
    callback: nextSite,
    allowedPatterns: ["adminpanel", "distracted", "site-arrived", "finished-study", "finished-study-thoughts"],
    threadId: "else-no"
  });

  // I'm here

  ChatBot.addPatternObject({
    regexp: "I'm here",
    actionValue: "Great, what's going on?",
    callback: function(){ 
      sitesVisited.push(currentSite.name);
      ChatBot.addSetResponses(["I learned something", "I tried something", "I bought something", "I enjoyed something", "I didn't like something"]);
    },
    allowedPatterns: ["adminpanel", "learned","bought","enjoyed","tried","disliked"],
    threadId: "site-arrived"
  });

  // I x something

  ChatBot.addPatternObject({
    regexp: "I learned something",
    actionValue: "What did you learn? What was your interest?",
    allowedPatterns: ["adminpanel", "site-anything-else"],
    threadId: "learned"
  });

  ChatBot.addPatternObject({
    regexp: "I bought something",
    actionValue: "What did you buy and why?",
    allowedPatterns: ["adminpanel", "site-anything-else"],
    threadId: "bought"
  });

  ChatBot.addPatternObject({
    regexp: "I enjoyed something",
    actionValue: "What was enjoyable and why?",
    allowedPatterns: ["adminpanel", "site-anything-else"],
    threadId: "enjoyed"
  });

  ChatBot.addPatternObject({
    regexp: "I tried something",
    actionValue: "What did you learn? What was your interest?",
    allowedPatterns: ["adminpanel", "site-anything-else"],
    threadId: "tried"
  });

  ChatBot.addPatternObject({
    regexp: "I didn't like something",
    actionValue: "What didn't you like and why?",
    allowedPatterns: ["adminpanel", "site-anything-else"],
    threadId: "disliked"
  });

  //Site Anything Else

  ChatBot.addPatternObject({
    regexp: "(.*?)",
    actionValue: "Anything else you'd like to add?",
    callback: function(){ ChatBot.addSetResponses(["Yes", "No"]); },
    allowedPatterns: ["adminpanel", "site-else-yes", "site-else-no"],
    threadId: "site-anything-else"
  });

  //Site Anything Else - Yes

  ChatBot.addPatternObject({
    regexp: "Yes",
    actionValue: "What else happened?",
    callback: function(){ 
      ChatBot.addSetResponses(["I learned something", "I tried something", "I bought something", "I enjoyed something", "I didn't like something"]);
    },
    allowedPatterns: ["adminpanel", "learned","bought","enjoyed","tried","disliked"],
    threadId: "site-else-yes"
  });

  //Site Anything Else - No

  ChatBot.addPatternObject({
    regexp: "No",
    actionValue: "Are you finished in this area?",
    callback: function(){ ChatBot.addSetResponses(["Yes", "No"]); },
    allowedPatterns: ["adminpanel", "finished-area", "not-finished-area"],
    threadId: "site-else-no"
  });

  //Finished in area

  ChatBot.addPatternObject({
    regexp: "Yes",
    actionValue: "OK, let's move on.",
    callback: nextSite,
    allowedPatterns: ["adminpanel", "distracted", "site-arrived", "finished-study", "finished-study-thoughts"],
    threadId: "finished-area"
  });

  //Not finished in area

  ChatBot.addPatternObject({
    regexp: "No",
    actionValue: "OK. Tell me more about what's going on.",
    callback: function(){ 
      ChatBot.addSetResponses(["I learned something", "I tried something", "I bought something", "I enjoyed something", "I didn't like something"]);
    },
    allowedPatterns: ["adminpanel", "learned","bought","enjoyed","tried","disliked"],
    threadId: "not-finished-area"
  });

  // Outro

  ChatBot.addPatternObject({
    regexp: "Yes I do",
    actionValue: "Ok, feel free to mention any aspect of today.",
    allowedPatterns: ["adminpanel", "finished-study-comment"],
    threadId: "finished-study-thoughts"
  });

  ChatBot.addPatternObject({
    regexp: "No, I'm done",
    actionValue: "Thanks, please return this phone to the researchers.",
    allowedPatterns: [],
    threadId: "finished-study"
  });

  ChatBot.addPatternObject({
    regexp: "(.*?)",
    actionValue: "Thanks, please return this phone to the researchers.",
    allowedPatterns: [],
    threadId: "finished-study-comment"
  });

};

/*

TODO:

Fix matching with new line values e.g. "My name \n is XYZ"
Fix non-scrolling / partially hidden responses (low priority)

Help button response
'Respond with picture' option
Convo content

Content: 

- Espark area
- Aberdeenshire area
- Scotland Larder live
- Area orders: 1st is the same, then other two are different
- Outro (triggers after last event)

---

Area questions

I tried something
I didn't like something 
I enjoyed something
I learned something
I bought something

---

What didn't you like and why? [pic/text] - Anything else?  
What did you buy and why? [pic/text] - Anything else?
What did you learn? and what was your interest in it? [pic/text] - Anything else?
What was enjoyable and why? [pic/text] - Anything else?
What did you try and how was it? - [pic/text] - Anything else?

---

Anything else? - [yes/no] 
  no: Are you finished in this <area>? 
    no: return to <area> choices, yes: suggest next place
  yes: Loop back to area questions

---

Outro: Great thanks for helping! Do you have anything else to add about your experience today? 
[answer]
Thanks for that. Please return this phone back to the researchers.

*/