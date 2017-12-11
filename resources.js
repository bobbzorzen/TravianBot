var numberStringToInt = function (str) {
    return parseInt(str.replace(/[^\d]/g, ""));
}

function Resources() {
    this.woodProduction = 0;
    this.clayProduction = 0;
    this.ironProduction = 0;
    this.wheatProduction= 0;

    this.getWarehouseSize = function () {
        return numberStringToInt(jQuery("#stockBarWarehouse").text());
    };

    this.getSiloSize = function () {
        return numberStringToInt(jQuery("#stockBarGranary").text());
    };

    this.getWood = function () {
        return numberStringToInt(jQuery("#stockBarResource1 span").text());
    };

    this.getClay = function () {
        return numberStringToInt(jQuery("#stockBarResource2 span").text());
    };

    this.getIron = function () {
        return numberStringToInt(jQuery("#stockBarResource3 span").text());
    };

    this.getWheat = function () {
        return numberStringToInt(jQuery("#stockBarResource4 span").text());
    };
}