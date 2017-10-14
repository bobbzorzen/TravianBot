// ==UserScript==
// @name         mainbot.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        ts7.travian.com/*
// @match        tx3.travian.com/*
// @grant        none
// @require      http://bobbzorzen.se/travian/utils.js
// @require      http://bobbzorzen.se/travian/ui.js
// @require      http://bobbzorzen.se/travian/constants.js
// ==/UserScript==


(function() {
    'use strict';
    function TravianBot() {
        this.wood = 0;
        this.clay = 0;
        this.stone = 0;
        this.wheat = 0;
        this.currentPage = "dorf1.php";
        this.activeBuilds = [];

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
                var elemData = elem.alt.match(/([A-z\s]+)\sLevel\s([\d])/);
                if(elemData) {
                    var type = elemData[1];
                    var level = elemData[2];
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
                return enqueuedValues[0].id;
            }
            return this.resourceFields[0].buildId;
        };
        this.handlePage = function () {
            if(this.currentPage == PAGES.resources) {
                console.log("ON RESOURCES PAGE");
                console.log("amount of active builds: ", this.activeBuilds.length);
                console.log("Upcoming build: ", this.getNextBuildPage());
                if(this.activeBuilds.length == 0) {                
                    this.gotoBuildPage(this.getNextBuildPage());
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
                        if(enqueuedValues[0].id == getUrlParameter("id")) {
                            console.log("Unshift buiulding nr: ", enqueuedValues[0])
                            enqueuedValues.shift()
                            setCookie("queuedbuilds", JSON.stringify(enqueuedValues));
                        }
                    }
                    this.build();
                } else {
                    this.gotoResourcePage();

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
                    }
                }catch(e) {
                    console.log("Error happened? ", e);
                }
            }, 5000);
        }, 1000);
    }
})();