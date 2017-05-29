var chatbotDb = (function () {

  var db = window.openDatabase("rhschatbotDb", "1.0", "RHS Chatbot History", 4 * 1024 * 1024);

  return {

    migrate: function(){
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (timestamp unique, text, origin, originName)', [], 
          function(){ console.log("LOGS table created"); }, 
          function(){ console.log("Couldn't created LOGS table"); });
        tx.executeSql('CREATE TABLE IF NOT EXISTS ALLOWED_PATTERNS (name)', [], 
          function(){ console.log("ALLOWED_PATTERNS table created"); }, 
          function(){ console.log("Couldn't created ALLOWED_PATTERNS table"); });
      });
    },

    reset: function() {
      db.transaction(function (tx) {
        tx.executeSql("DROP TABLE LOGS", [], 
          function(){ console.log("Dropped table LOGS"); }, 
          function(){ console.log("Couldn't drop table LOGS");  });
        tx.executeSql("DROP TABLE ALLOWED_PATTERNS", [], 
          function(){ console.log("Dropped table ALLOWED_PATTERNS"); }, 
          function(){ console.log("Couldn't drop table ALLOWED_PATTERNS");  
        });
      }, function(){ console.log("Couldn't reset"); }, function(){ chatbotDb.migrate(); });
    },

    insertLog: function(text, origin, originName) {
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO LOGS (timestamp, text, origin, originName) VALUES (?, ?, ?, ?)', [new Date-0, text, origin, originName], 
          function(tx,results){}, 
          function(tx, error){ console.log(error); } );
      });
    },

    insertAllowedPattern: function(name) {
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO ALLOWED_PATTERNS (name) VALUES (?)', [name], 
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

    allowedPatterns: function(cb){
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ALLOWED_PATTERNS', [], function (tx, results) {
          var rows = [];
          var i;
          for (i = 0; i < results.rows.length; i++){
            rows.push(results.rows.item(i).name);
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
    },

    printAllowedPatterns: function() {
      chatbotDb.allowedPatterns(function(rows){ console.log(rows) });
    }

  }
})();
