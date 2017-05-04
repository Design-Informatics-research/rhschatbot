$(document).ready(function(){

  var app = {

    initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
      document.addEventListener("resume", this.onResume.bind(this), false);
      document.addEventListener("pause", this.onPause.bind(this), false);
    },

    onResume: function () {
      this.receivedEvent('onresume');
    },

    onPause: function () {
      this.receivedEvent('onpause');
    },

    onDeviceReady: function() {
      this.receivedEvent('deviceready');
    },

    receivedEvent: function(id) {
      var parentElement = document.getElementById('device-event');
      var listeningElement = parentElement.querySelector('.listening');
      var receivedElement = parentElement.querySelector('.received');

      listeningElement.setAttribute('style', 'display:none;');
      receivedElement.setAttribute('style', 'display:block;');
      receivedElement.innerHTML = id;
    }
  };

  app.initialize();

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
  ChatBot.setBotName("Duck Duck Go Bot");
  ChatBot.addPattern("^hi$", "response", "Howdy, friend", undefined, "Say 'Hi' to be greeted back.");
  ChatBot.addPattern("^bye$", "response", "See you later buddy", undefined, "Say 'Bye' to end the conversation.");
  ChatBot.addPattern("(?:my name is|I'm|I am) (.*)", "response", "hi $1, thanks for talking to me today", function (matches) {
    ChatBot.setHumanName(matches[1]);
  },"Say 'My name is [your name]' or 'I am [name]' to be called that by the bot");
  ChatBot.addPattern("(what is the )?meaning of life", "response", "42", undefined, "Say 'What is the meaning of life' to get the answer.");
  ChatBot.addPattern("compute ([0-9]+) plus ([0-9]+)", "response", undefined, function (matches) {
    ChatBot.addChatEntry("That would be "+(1*matches[1]+1*matches[2])+".","bot");
  },"Say 'compute [number] plus [number]' to make the bot your math monkey");

  $('#sampleconvo').click(function(){
    if (!ChatBot.playConversation(sampleConversation,4000)) {alert('conversation already running');};
  });

  $('#options').click(function(){
    $('#chatBotCommandDescription').slideToggle();
  });

  chatbotDb.printLogs();
});
