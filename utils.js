
//#########
//# UTILS #
//#########

function setCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}
function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

function isFunc(a){
    return( (a) && (typeof a==='function') );
}
function jsL0ad(url,id,cllbck){
    if(!url) return((isFunc(cllbck))?cllbck():undefined);
    var hd=document.getElementsByTagName('head')[0],r=false;
    if(!hd) return((isFunc(cllbck))?cllbck():undefined);
    var s=document.createElement('script');
    s.type='text/javascript';
    s.src=url;
    if(id!=undefined) s.id=id;
    s.onload=s.onreadystatechange=function(){
        if((!r)&&((!this.readyState)||(this.readyState=='loaded')||(this.readyState=='complete'))){
            r=true;
            if(isFunc(cllbck)) cllbck();
            s.onload=s.onreadystatechange=null;
            hd.removeChild(s);
        }
    };
    hd.appendChild(s);
}
function jqChkLoad(v,cllbck){
    if(window.jQuery) return((isFunc(cllbck))?cllbck():undefined);
    if(!v) v='2.1.3';
    var cllbck1=cllbck;
    if(window.$){
        cllbck1=function(){
            jQuery.noConflict();
            if(isFunc(cllbck)) cllbck();
        };
    }
    jsL0ad('//ajax.googleapis.com/ajax/libs/jquery/'+v+'/jquery.min.js',undefined,cllbck1);
}
jqChkLoad();
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


console.log("UTILS LOADED");