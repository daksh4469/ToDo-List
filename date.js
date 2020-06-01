module.exports = getDay;

function getDay(){
    var today = new Date();
var cday = today.getDay();

var options = {
    weekday:"long",
    month:"long",
    day:"numeric"
};

var day = today.toLocaleDateString("en-US", options); 
return day;
}
