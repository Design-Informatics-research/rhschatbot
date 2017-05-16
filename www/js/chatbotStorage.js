var chatbotDb = (function () {

  var db = window.openDatabase("rhschatbotDb", "1.0", "RHS Chatbot History", 4 * 1024 * 1024);

  return {

    migrate: function(){
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (timestamp unique, text, origin)', [], 
          function(){ console.log("LOGS table created"); }, 
          function(){ console.log("Couldn't created LOGS table"); });
      });
    },

    reset: function() {
      db.transaction(function (tx) {
        tx.executeSql("DROP TABLE LOGS", [], 
          function(){ console.log("Dropped table LOGS, running migrate"); chatbotDb.migrate(); }, 
          function(){ console.log("Couldn't drop table logs");  });
      });
    },

    insertLog: function(text, origin) {
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO LOGS (timestamp, text, origin) VALUES (?, ?, ?)', [new Date-0, text, origin], 
          function(tx,results){}, 
          function(tx, error){ console.log(error); } );
      });
    },

    printLogs: function() {
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
          var len = results.rows.length, i;

          if (len == 0) { console.log("Logs table is empty"); return; }    
          for (i = 0; i < len; i++){
            msg = results.rows.item(i).timestamp + " " + results.rows.item(i).origin + ": " + results.rows.item(i).text;
            console.log(msg);
          }
        }, null);
      });
    }

  }
})();
