document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('checkPage');
    console.log("STUUUUUUFFFF");
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    var connectionEstablished = false;
    var connection = new WebSocket('wss://bobbzorzen.se:1337');
    var villages = {}
    var render = function () {
        $("table").remove();
        table = $("<table>");
        table.append("<tr><th>Name</th><th>Wood</th><th>Clay</th><th>Iron</th><th>Wheat</th><th>Incoming attack</th></tr>")
        console.log("Table: ", table)
        for(villageName in villages) {
            var village = villages[villageName];
            console.log("Village: ", village)
            var tr = $("<tr>")
            tr.append($("<td>").text(villageName))
            tr.append($("<td>").text(village.wood.ammount).addClass((village.wood.isFull != 0)?"red":""))
            tr.append($("<td>").text(village.clay.ammount).addClass((village.clay.isFull != 0)?"red":""))
            tr.append($("<td>").text(village.iron.ammount).addClass((village.iron.isFull != 0)?"red":""))
            tr.append($("<td>").text(village.wheat.ammount).addClass((village.wheat.isFull != 0)?"red":""))
            table.append(tr)
        }
        $("body").append(table)
    };
    connection.onopen = function () {
        console.log("Socket connection established!");
        connectionEstablished = true;
    };
    connection.onerror = function (error) {
        console.log("Websocket error!");
    };
    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
            console.log("MESSAGE, GOT!: ", json);
            villages = json;
            render()
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
    };
    
    sendDataToServer = function (data) {
        console.log("CONNECTION ESTABLISHED: ", connectionEstablished)
        if(connectionEstablished) {
            connection.send(data);
            return true;
        }
        console.log("Connection to server not ok, message not sent")
        return false;
    }

    checkPageButton.addEventListener('click', function() {
        console.log("Stuff");
        sendDataToServer("extension")
    }, false);
}, false);