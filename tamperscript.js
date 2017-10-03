// ==UserScript==
// @name         mainbot.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        ts7.travian.com/*
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
                wood: parseInt(jQuery("div.showCosts span.resources.r1").text().replace(/[^\d]/g, "")),
                clay: parseInt(jQuery("div.showCosts span.resources.r2").text().replace(/[^\d]/g, "")),
                stone: parseInt(jQuery("div.showCosts span.resources.r3").text().replace(/[^\d]/g, "")),
                wheat: parseInt(jQuery("div.showCosts span.resources.r4").text().replace(/[^\d]/g, ""))
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

        this.handlePage = function () {
            if(this.currentPage == PAGES.resources) {
                console.log("ON RESOURCES PAGE");
                console.log("amount of active builds: ", this.activeBuilds.length);
                console.log("Upcoming build: ", this.resourceFields[0].href);
                if(this.activeBuilds.length == 0) {
                //    this.gotoBuildPage(1);
                    this.gotoBuildResourcePage(this.resourceFields[0].href);
                }
            }
            else if (this.currentPage == PAGES.build){
                console.log("ON BUILD PAGE");
                console.log("Build cost: ", this.getBuildCost());
                console.log("Build is affortable: ", this.canAffordBuild());
                var currentBuilding = getUrlParameter("id");
                console.log("Build page: " + currentBuilding);
                if(this.canAffordBuild()) {
                    this.build();
                } else {
                    this.gotoResourcePage();
                    // var nextBuildPage = parseInt(currentBuilding)+1;
                    // if(nextBuildPage > 18) {
                    //     setTimeout(function () {
                    //         this.gotoResourcePage();
                    //     }, 60000);
                    // }
                    // else {
                    //     this.gotoBuildPage(nextBuildPage);
                    // }
                }
            }
            else if (this.currentPage == PAGES.city) {
                // this.gotoResourcePage();
                console.log(this.getCityBuildingData());
            }
        };
    }
    console.log("Sleeping a second before starting bot");
    setTimeout(function () {
        addAreYouThere();
        var bot = new TravianBot();
        setInterval(function() {
            console.clear();
            if(!areYouThere()) {
                bot.getState();
                // bot.printCurrentState();
                bot.handlePage();
            } else {
                console.log("Bot disabled, does nothing");
            }
        }, 5000);
    }, 1000);
})();