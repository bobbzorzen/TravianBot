window.WebSocket = window.WebSocket || window.MozWebSocket;
var connectionEstablished = false;
var connection = new WebSocket('wss://bobbzorzen.se:1337');
console.log("gonna backgroundify some things");

function getFullStorages(villages) {
    var fullStorages = []
    for(villageName in villages) {
        var village = villages[villageName];
        if(village.wood.isFull) {
            fullStorage.append({"title": villageName, "message": "Wood: " + village.wood})
        }
        else if(village.clay.isFull) {
            fullStorage.append({"title": villageName, "message": "Clay: " + village.clay})
        }
        else if(village.iron.isFull) {
            fullStorage.append({"title": villageName, "message": "Iron: " + village.iron})
        }
        else if(village.wheat.isFull) {
            fullStorage.append({"title": villageName, "message": "Wheat: " + village.wheat})
        }
    }
    return fullStorages
}

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
        notifyList(getFullStorages(villages))
    } catch (e) {
        console.log("e: ", e)
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

var notifyList = function (listItems) {
    console.log("NOTIFYING, list: ", listItems)
    if(listItems.length == 0) {
        console.log("No full storages")
    } else {
        var opt = {
            type: "list",
            title: "Full stores",
            message: "List of full storages",
            iconUrl: "icon.png",
            items: listItems
        }
        chrome.notifications.create(opt);
    }
};

var notify = function (msg) {
    console.log("NOTIFYING, message: ", msg)
    var opt = {
        type: "basic",
        title: "Full stores",
        message: msg,
        iconUrl: "icon.png"
    }
    chrome.notifications.create(opt);
};
setInterval(function() {
    console.log("Stuff");
    sendDataToServer("extension")
}, 1000*5);
