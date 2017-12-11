// ==UserScript==
// @name         mainbot.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        ts7.travian.com/*
// @match        tx3.travian.com/*
// @match        ts3.travian.com/*
// @grant        none
// @require      http://bobbzorzen.se/travian/utils.js
// @require      http://bobbzorzen.se/travian/ui.js
// @require      http://bobbzorzen.se/travian/constants.js
// @require      http://bobbzorzen.se/travian/resources.js
// ==/UserScript==


(function() {
    'use strict';
    function TravianBot() {
        this.resources = new Resources();
        this.wood = 0;
        this.clay = 0;
        this.stone = 0;
        this.wheat = 0;
        this.currentPage = "dorf1.php";
        this.activeBuilds = [];
        this.connectionEstablished = false;
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        this.connection = new WebSocket('wss://bobbzorzen.se:1337');
        self = this;
        this.connection.onopen = function () {
            console.log("Socket connection established!");
            self.connectionEstablished = true;
        };
        this.connection.onerror = function (error) {
            console.log("Websocket error!");
        };
        this.connection.onmessage = function (message) {
            try {
                var json = JSON.parse(message.data);
                console.log("MESSAGE, GOT!: ", json);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ',
                            message.data);
                return;
            }
        };

        this.sendDataToServer = function (data) {
            console.log("CONNECTION ESTABLISHED: ", this.connectionEstablished)
            if(this.connectionEstablished) {
                this.connection.send(data);
                return true;
            }
            console.log("Connection to server not ok, message not sent")
            return false;
        }

        this.getActiveBuilds = function () {
            var builds = [];
            var activeBuildsRAW = jQuery(".boxes.buildingList ul li");
            activeBuildsRAW.each(function (index, elem) {
                var obj = {
                    name: jQuery(elem).find("div.name").text().replace(/[^\w\s!?]/g,'').replace(/\s+/g, ' '),
                    duration: jQuery(elem).find("div.buildDuration span.timer").text()
                };
                builds.push(obj);
            });
            return builds;
        };

        this.getFieldData = function () {
            var fieldData = [];
            jQuery("map area").each(function(index, elem){
                var elemData = elem.alt.match(/([A-z\s]+)\sLevel\s([\d]+)/);
                if(elemData) {
                    var type = elemData[1];
                    var level = parseInt(elemData[2]);
                    var field = {
                        type: type,
                        level: level,
                        buildId: elem.href.match(/\?.*id=([\d]+)/)[1]
                    };
                    fieldData.push(field);
                }
            });
            fieldData.sort(function (a, b) {
                if(a.level < b.level){return -1;}
                if(a.level > b.level){return 1;}
                return 0;
            });
            console.log("Field data: ", fieldData);
            return fieldData;
        };

        this.getCityBuildingData = function () {
            var fieldData = [];
            jQuery("map area").each(function(index, elem){
                var elemData = elem.alt.match(/^([A-z\s]+)\s.+>Level\s([\d])/);
                if(elemData) {
                    var type = elemData[1];
                    var level = elemData[2];
                    var field = {
                        type: type,
                        level: level,
                        href: elem.href
                    };
                    fieldData.push(field);
                }
            });
            fieldData.sort(function (a, b) {
                if(a.level < b.level){return -1;}
                if(a.level > b.level){return 1;}
                return 0;
            });
            return fieldData;
        };

        this.getState = function () {
            this.wood = jQuery("#stockBarResource1 span").text().replace(/[^\d]/g, "");
            this.clay = jQuery("#stockBarResource2 span").text().replace(/[^\d]/g, "");
            this.stone = jQuery("#stockBarResource3 span").text().replace(/[^\d]/g, "");
            this.wheat = jQuery("#stockBarResource4 span").text().replace(/[^\d]/g, "");
            this.currentPage = location.pathname.substring(1);
            this.activeBuilds = this.getActiveBuilds();
            this.resourceFields = this.getFieldData();
        };
        this.getBuildCost = function () {
            return {
                wood: parseInt(jQuery("div.showCosts span.resources.r1").first().text().replace(/[^\d]/g, "")),
                clay: parseInt(jQuery("div.showCosts span.resources.r2").first().text().replace(/[^\d]/g, "")),
                stone: parseInt(jQuery("div.showCosts span.resources.r3").first().text().replace(/[^\d]/g, "")),
                wheat: parseInt(jQuery("div.showCosts span.resources.r4").first().text().replace(/[^\d]/g, ""))
            };
        };
        this.gotoBuildPage = function (id) {
            window.location = "https://" + window.location.hostname+"/build.php?id="+id;
        };
        this.gotoBuildResourcePage = function (path) {
            window.location = path;
        };

        this.gotoResourcePage = function () {
            window.location = "https://" + window.location.hostname+"/" + PAGES.resources;
        };

        this.canAffordBuild = function () {
            if(jQuery(".upgradeButtonsContainer").length == 0) { // Building is completely upgraded
                return false;
            }
            var buildCost = this.getBuildCost();
            var enoughWood = this.wood >= buildCost.wood;
            var enoughClay = this.clay >= buildCost.clay;
            var enoughStone= this.stone>= buildCost.stone;
            var enoughWheat= this.wheat>= buildCost.wheat;
            return ( enoughWood  &&
                     enoughClay  &&
                     enoughStone &&
                     enoughWheat);
        };
        this.build = function () {
            jQuery(".upgradeButtonsContainer button.green.build").first().click();
        };

        this.printCurrentState = function () {
            console.log("wood: " + this.wood);
            console.log("clay: " + this.clay);
            console.log("stone: " + this.stone);
            console.log("wheat: " + this.wheat);
            console.log("Current Page: " +this.currentPage);
            console.log("Current active builds: ", this.activeBuilds);
        };
        this.getNextBuildPage = function () {
            var enqueuedValues = JSON.parse(getCookie("queuedbuilds"));
            if(enqueuedValues.length > 0) {
                for(var i = 0; i < enqueuedValues.length; i++) {
                    if(enqueuedValues[i].village == this.getCurrentVillageName()){
                        return enqueuedValues[i].id;
                    }
                }
            }
            return this.resourceFields[0].buildId;
        };
        this.getCurrentVillageName = function () {
            return jQuery("#sidebarBoxVillagelist ul li.active .name").text();
        }
        this.getNextVillagePage = function () {
            var nextVillageLI = jQuery("#sidebarBoxVillagelist ul li.active + li")
            if(nextVillageLI.length == 0) {
                nextVillageLI = jQuery("#sidebarBoxVillagelist ul li:not(.active)").first()
            }
            var nextVillageHref = "";
            if(nextVillageLI.length > 0) {
                nextVillageHref = "https://" + window.location.hostname + "/" + PAGES.resources + nextVillageLI.find("a").attr("href");
            }
            //console.log("Next village: ", nextVillageHref);
            return nextVillageHref;
        }
        this.sendVillageData = function () {
            
            var isWoodFull = jQuery("#stockBarResource1 .barBox .stockFull").length;
            var isClayFull = jQuery("#stockBarResource2 .barBox .stockFull").length;
            var isIronFull = jQuery("#stockBarResource3 .barBox .stockFull").length;
            var isWheatFull = jQuery("#stockBarResource4 .barBox .stockFull").length;

            var resourceObject = {
                "villageName": this.getCurrentVillageName(),
                "wood": {"ammount": this.wood, "isFull": isWoodFull},
                "clay": {"ammount": this.clay, "isFull": isClayFull},
                "iron": {"ammount": this.iron, "isFull": isIronFull},
                "wheat": {"ammount": this.wheat, "isFull": isWheatFull},
            }
            this.sendDataToServer(JSON.stringify(resourceObject));
        }
        this.handlePage = function () {
            if(this.currentPage == PAGES.resources) {
                console.log("ON RESOURCES PAGE");
                console.log("amount of active builds: ", this.activeBuilds.length);
                console.log("Upcoming build: ", this.getNextBuildPage());
                this.sendVillageData();
                if(this.activeBuilds.length == 0) {                
                    //console.log("next page: ", this.getNextBuildPage());
                    this.gotoBuildPage(this.getNextBuildPage());
                } else {
                    window.location = this.getNextVillagePage();
                }
            }
            else if (this.currentPage == PAGES.build){
                console.log("ON BUILD PAGE");
                console.log("Build cost: ", this.getBuildCost());
                console.log("Build is affortable: ", this.canAffordBuild());
                var currentBuilding = getUrlParameter("id");
                console.log("Build page: " + currentBuilding);
                if(this.canAffordBuild()) {
                    var enqueuedValues = JSON.parse(getCookie("queuedbuilds"));
                    if(enqueuedValues.length) {
                        for(var i = 0; i < enqueuedValues.length; i++) {
                            if(enqueuedValues[i].village == this.getCurrentVillageName()){
                                if(enqueuedValues[i].id == getUrlParameter("id")) {
                                    console.log("Unshift buiulding nr: ", enqueuedValues[i])
                                    enqueuedValues.splice(i, 1);
                                    setCookie("queuedbuilds", JSON.stringify(enqueuedValues));
                                }
                                break;
                            }
                        }
                    }
                    this.build();
                } else {
                    var nextVillagePage = this.getNextVillagePage();
                    if(nextVillagePage != "") {
                        window.location = nextVillagePage;
                    }
                }
            }
            else if (this.currentPage == PAGES.city) {
                // this.gotoResourcePage();
                console.log(this.getCityBuildingData());
                this.gotoResourcePage();
            }
        };
    }
    console.log("Sleeping a second before starting bot");
    if(location.pathname.substring(1) == PAGES.map) {
        var interval = setInterval(function() {
            var tipInfo = jQuery(".tip .tip-contents").text();
            var coordinatesX = jQuery(".tip .tip-contents .coordinateX").text()
            var coordinatesY = jQuery(".tip .tip-contents .coordinateY").text()
            if(tipInfo.indexOf("Abandoned valley") != -1) {
                console.log("tipInfo: ", tipInfo);
            }
        }, 100);
    }
    if(location.pathname.substring(1) != PAGES.manual) {
        setTimeout(function () {
            addCustomUiElements();
            addAreYouThere();
            addQueuedBuildings();
            addQuickfillButtonsForVillages();
            
            var bot = new TravianBot();
            if(location.pathname.substring(1) == PAGES.build) {
                addQueueButton();
            }
            var interval = setInterval(function() {
                try {
                    if(jQuery("button[value='Login']").length == 0) {
                        console.clear();
                        if(!areYouThere()) {
                            bot.getState();
                            // bot.printCurrentState();
            
                            bot.handlePage();
                        } else {
                            console.log("Bot disabled, does nothing");
                        }
                    } else {
                        if(jQuery("#recaptcha_image").length == 0) {
                            jQuery("button[value='Login']").first().click(); // Try to login
                        } else {
                            //TODO: Solve ReCaptchas...
                        }
                    }
                }catch(e) {
                    console.log("Error happened? ", e);
                }
            }, 5000);
        }, 1000);
    }
})();

