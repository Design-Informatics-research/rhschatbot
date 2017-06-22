var chatbotDb = (function () {

  var db = window.openDatabase("rhschatbotDb", "1.0", "RHS Chatbot History", 4 * 1024 * 1024);

  return {

    migrate: function(){
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (timestamp unique, text, origin, originName, latitude, longitude, accuracy, heading, speed, locTimestamp)', [], 
          function(){ console.log("LOGS table created"); }, 
          function(){ console.log("Couldn't created LOGS table"); });
        tx.executeSql('CREATE TABLE IF NOT EXISTS STATE (threadId, visitedSites)', [], 
          function(){ console.log("STATE table created"); }, 
          function(){ console.log("Couldn't created STATE table"); });
      });
    },

    reset: function() {
      db.transaction(function (tx) {
        tx.executeSql("DROP TABLE LOGS", [], 
          function(){ console.log("Dropped table LOGS"); }, 
          function(){ console.log("Couldn't drop table LOGS");  });
        tx.executeSql("DROP TABLE STATE", [], 
          function(){ console.log("Dropped table STATE"); }, 
          function(){ console.log("Couldn't drop table STATE");  
        });
      }, function(){ console.log("Couldn't reset"); }, function(){ chatbotDb.migrate(); });
    },

    insertLog: function(text, origin, originName, position) {
      db.transaction(function (tx) {
        tx.executeSql('INSERT INTO LOGS (timestamp, text, origin, originName, latitude, longitude, accuracy, heading, speed, locTimestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [new Date-0, text, origin, originName, position.latitude, position.longitude, position.accuracy, position.heading, position.speed, position.timestamp], 
          function(tx,results){}, 
          function(tx, error){ console.log(error); } );
      });
    },

    saveState: function(threadId, visitedSites) {
      db.transaction(function (tx) {
        try { allowedPatterns = allowedPatterns.join() } catch(e){}
        try { setResponses = setResponses.join() } catch(e){}
        tx.executeSql('INSERT INTO STATE (threadId, visitedSites) VALUES (?, ?)', [threadId, visitedSites.join(",")], 
          function(tx,results){},
          function(tx, error){ console.log(error); } );
      });
    },

    deleteState: function(cb){
      db.transaction(function (tx) {
        tx.executeSql('DELETE FROM STATE', [], 
          function(tx,results){ /*if (cb) { cb() }*/ },
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

    states: function(cb){
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM STATE', [], function (tx, results) {
          var rows = [];
          var i;
          for (i = 0; i < results.rows.length; i++){
            rows.push(results.rows.item(i));
          }
          cb(rows);
        }, null);
      });
    },

    lastState: function(cb){
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM STATE', [], function (tx, results) {
          var lastItem;
          var visitedSites = [];
          if (results.rows.length > 0){
            lastItem = results.rows.item(results.rows.length-1);           
            if (lastItem.visitedSites.length > 0) { visitedSites = lastItem.visitedSites.split(","); }
          }
          cb(lastItem.threadId, visitedSites);
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

    printStates: function() {
      chatbotDb.states(function(rows){ console.log(rows) });
    }

  }
})();
