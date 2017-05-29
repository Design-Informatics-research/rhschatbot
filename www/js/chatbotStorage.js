var chatbotDb = (function () {

  var db = window.openDatabase("rhschatbotDb", "1.0", "RHS Chatbot History", 4 * 1024 * 1024);

  return {

    migrate: function(){
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (timestamp unique, text, origin, originName, allowedPatterns)', [], 
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

    insertLog: function(text, origin, originName, allowedPatterns) {
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO LOGS (timestamp, text, origin, originName, allowedPatterns) VALUES (?, ?, ?, ?, ?)', [new Date-0, text, origin, originName, allowedPatterns], 
          function(tx,results){}, 
          function(tx, error){ console.log(error); } );
      });
    },

    logs: function(cb){
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM LOGS', [], function (tx, results) {
          var rows = [];
          var i;
          for (i = 0; i < results.rows.length; i++){
            rows.push(results.rows.item(i));
          }
          cb(rows);
        }, null);
      });
    },

    printLogs: function() {
      chatbotDb.logs(function(rows){
        var i;
        var r;
        if (rows.length == 0) { console.log("Logs table is empty"); return; }    
        for (i = 0; i < rows.length; i++){
          //r = rows[i].timestamp + " " + rows[i].origin + ": " + rows[i].text;
          console.log(rows[i]);
        }
      });
    }

  }
})();
