//#################
//# Are You There #
//#################
var addAreYouThere = function () {
    var areYouThere = getCookie("areyouthere");
    var checked = "";
    if(areYouThere == "true") {
        checked = "checked";
    }
    console.log("AreYouThere: ", areYouThere, " checked: ", checked);
    var areYouThereCheckbox = jQuery("<label style='position:absolute;top:5px;left:5px; border: 1px solid #DFDFDF; background-color: #EBEBEB; padding: 5px; z-index: 10;'><input type='checkbox' "+checked+" id='are-you-there'> Are you there?</label>");
    jQuery("body").append(areYouThereCheckbox);
    areYouThereCheckbox.find("input").on("click", function (e){
        console.log("Player is here: ", e.currentTarget.checked);
        setCookie("areyouthere", e.currentTarget.checked);
    });
};
var areYouThere = function () {
    return jQuery("#are-you-there")[0].checked;
};