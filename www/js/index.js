$(document).ready(function(){

  var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

app.initialize();

  var sampleConversation = ["Hi", "My name is Fry", "Where is China?", "What is the population of China?", "Bye"];
  var mashapeApiKey = 'YOUR_MASHAPE_API_KEY';
  var wx = ChatBot.Engines.webknox(mashapeApiKey);

  var config = {
    botName: 'WebKnox',
    inputs: '#humanInput',
    inputCapabilityListing: false,
    engines: [wx],
    addChatEntryCallback: function(entryDiv, text, origin) {
      entryDiv.delay(200).slideDown();
    }
  };

  ChatBot.init(config);
  ChatBot.setBotName("WebKnox");
  ChatBot.addPattern("^hi$", "response", "Howdy, friend", undefined, "Say 'Hi' to be greeted back.");
  ChatBot.addPattern("^bye$", "response", "See you later buddy", undefined, "Say 'Bye' to end the conversation.");
  ChatBot.addPattern("(?:my name is|I'm|I am) (.*)", "response", "hi $1, thanks for talking to me today", 
    function (matches) { ChatBot.setHumanName(matches[1]); },"Say 'My name is [your name]' or 'I am [name]' to be called that by the bot");
  ChatBot.addPattern("(what is the )?meaning of life", "response", "42", undefined, "Say 'What is the meaning of life' to get the answer.");
  ChatBot.addPattern("compute ([0-9]+) plus ([0-9]+)", "response", undefined, 
    function (matches) { ChatBot.addChatEntry("That would be "+(1*matches[1]+1*matches[2])+".","bot"); },"Say 'compute [number] plus [number]' to make the bot your math monkey");   

  $('#sampleconvo').click(function(){
    if (!ChatBot.playConversation(sampleConversation,4000)) {alert('conversation already running');};
  });

  $('#options').click(function(){
    $('#chatBotCommandDescription').slideToggle();
  });
});
