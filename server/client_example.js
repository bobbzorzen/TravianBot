// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        developer.telerik.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    console.log("TEST");
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var connection = new WebSocket('wss://bobbzorzen.se:1337');

    connection.onopen = function () {
        console.log("OPENED!");
        // connection is opened and ready to use
        connection.send("TEST");

    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
        console.log("ERRORRED!");
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message
        // from server is json)
        try {
            var json = JSON.parse(message.data);
            console.log("MESSAGE, GOT!: ", json);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ',
                        message.data);
            return;
        }
        // handle incoming message
    };
})();
