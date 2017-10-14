//###############
//# UI ELEMENTS #
//###############


var addCustomUiElements = function () {
    var baseplateStyle = "style='position:absolute;top:5px;left:5px; border: 1px solid #DFDFDF; background-color: #EBEBEB; padding: 5px; z-index: 10;'";
    var baseplate = jQuery("<div id='customuiplate'"+baseplateStyle+" ></div>");
    var baseplateHeader = jQuery("<h4>Bot Control</h4>");
    baseplate.append(baseplateHeader);
    jQuery("#mainLayout>body").first().append(baseplate);
};

var addAreYouThere = function () {
    var areYouThere = getCookie("areyouthere");
    var checked = "";
    if(areYouThere == "true") {
        checked = "checked";
    }
    var areYouThereCheckbox = jQuery("<label><input type='checkbox' "+checked+" id='are-you-there'> Are you there?</label>");
    jQuery("#customuiplate").append(areYouThereCheckbox);
    areYouThereCheckbox.find("input").on("click", function (e){
        console.log("Player is here: ", e.currentTarget.checked);
        setCookie("areyouthere", e.currentTarget.checked);
    });
};
var areYouThere = function () {
    return jQuery("#customuiplate #are-you-there")[0].checked;
};

var addQueueButton = function () {
    var enQueuedValues = getCookie("queuedbuilds");
    if(enQueuedValues == null){
        setCookie("queuedbuilds", JSON.stringify([]));
    }
    var enQueueLink = jQuery("<a href='#' id='enqueue'> Queue build -> </a>");
    jQuery("#build .roundedCornersBox h4").append(enQueueLink);
    enQueueLink.on("click", function (e){
        console.log("Clicked the thing");
        var enqueuedValues = JSON.parse(getCookie("queuedbuilds"));
        var obj = {
            name: jQuery("h1.titleInHeader").text(),
            id: getUrlParameter("id")
        };
        enqueuedValues.push(obj);
        setCookie("queuedbuilds", JSON.stringify(enqueuedValues));
        addQueuedBuildings();
    });
};

var addQueuedBuildings = function () {
    jQuery("#customuiplate #enqueued-buildings").remove();
    var listWrapper = jQuery("<div id='enqueued-buildings'></div>");
    var listHeader = jQuery("<h5 style='margin-top: 10px; margin-bottom:5px;'>Currently enqueued buildings</h5>");
    listWrapper.append(listHeader);
    var enqueuedValues = JSON.parse(getCookie("queuedbuilds"));
    if(enqueuedValues == null){
        setCookie("queuedbuilds", JSON.stringify([]));
    }
    if(enqueuedValues.length > 0) {
        var list = jQuery("<ol style='padding-left:22px; margin: 0;'></ol>");
        for(var index = 0; index < enqueuedValues.length; index++) {
            var item = jQuery("<li>" + enqueuedValues[index].name + "(" + enqueuedValues[index].id + ") - <a href='#' data-index='" + index + "'>X</a></li>");
            list.append(item);
        }
        listWrapper.append(list);
    } else {
        listWrapper.append(jQuery("<span>No buildings enqueued!</span>"))
    }
    listWrapper.find("li a").on("click", function (event) {
        var element = jQuery(event.currentTarget);
        var index = element.data("index");
        console.log("Dequeueing: ", index);
        var enqueuedValues = JSON.parse(getCookie("queuedbuilds"));
        enqueuedValues.splice(index, 1);
        setCookie("queuedbuilds", JSON.stringify(enqueuedValues));
        addQueuedBuildings();
    });
    jQuery("#customuiplate").append(listWrapper);
};