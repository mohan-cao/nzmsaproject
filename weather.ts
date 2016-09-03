var NO_GEO_EX : number = -1;

$(document).ready(function() {
  init();
});

function init() : void {
  setUpForms();
  loadGeo();
}

var setUpForms = function() : void {
  $("form#custominput").submit(function(ev) {
    ev.preventDefault();
    $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text=\"" + $("#locInput").val() + "\")&format=json&callback=?").done(geoLoaded);
  });
  //TODO: make dropdown autocomplete work
};

var loadBackground = function(type : string) : boolean {
  var img : HTMLImageElement = new Image();
  var imgs = {
    "sunny": "https://upload.wikimedia.org/wikipedia/commons/b/b6/Desert_on_the_Cabeza_Prieta_national_wildlife_refuge.jpg",
    "snowy": "http://www.public-domain-photos.com/free-stock-photos-3/landscapes/mountains/snowy-mountain.jpg",
    "rainy": "https://static.pexels.com/photos/1553/glass-rainy-car-rain.jpg",
    "cloudy": "http://res.freestockphotos.biz/pictures/2/2469-thick-white-clouds-in-a-blue-sky-above-mountains-pv.jpg",
    "default": "https://unsplash.it/1680/900/?random"
  };
  if (type!==undefined&&!imgs.hasOwnProperty(type)) {
    return false;
  }
  img.src = imgs[type];
  img.onload = function() : void {
    $("div.background").each(function() {
      $(this).css("background-image", "url(" + img.src + ")").fadeTo(500,1);
    });
  };
  return true;
};

var weatherCodes = function(i : number) : string {
    if(i<5||(i>=8&&i<13)||(i>=37&&i<41)||i==35||i==45||i==47){
      return "rainy";
    }else if((i>=5&&i<8)||(i>=13&&i<19)||(i>=41&&i<44)||i==46){
      return "snowy";
    }else if((i>=19&&i<23)||(i>=26&&i<31)){
      return "cloudy";
    }else if(i>=31&&i<37&&i!=35){
      return "sunny";
    }else{
      return "default";
    }
};

var geoLoaded = function(geoData) : void {
  var current = geoData.query.results.channel;
  var temp = current.item.condition.temp;
  var celsius = (current.units.temperature === "F") ? false : true;
  var convertBetweenCF = function(val : string, units : string) : number {
    if (units === "C" || units === "c") {
      return Math.round(100 * (5 / 9 * (parseFloat(val) - 32))) / 100;
    } else if (units === "F" || units === "f") {
      return Math.round(100 * (1.8 * parseFloat(val) + 32)) / 100;
    }
    return Infinity;
  };
  $(".loading").hide(400);
  $(".custominput").hide(400);
  $("#location").text(current.location.city + ", " + current.location.region + ", " + current.location.country);
  $("#weathertype").html("<span id=\"temp\">" + Math.round(temp) + "</span>" + "<a href=\"#\" id=\"toggleUnits\">&deg;" + current.units.temperature + "</a>" + ", " + current.item.condition.text);
  $("#toggleUnits").click(function() {
    if (celsius) {
      $("#toggleUnits").html("&deg;F");
      temp = convertBetweenCF(temp, "F");
    } else {
      $("#toggleUnits").html("&deg;C");
      temp = convertBetweenCF(temp, "C");
    }
    $("#temp").text(Math.round(temp * 10) / 10);
    celsius = !celsius;
  });
  $(".content").show(400);
  loadBackground(weatherCodes(current.item.condition.code));
};

var loadGeo = function() : void {
  var geoEx = function(exceptionCode : any) : void {
    $(".loading").hide(0);
    $(".custominput").show(0);
  };
  if (navigator.hasOwnProperty("geolocation")) {
    //ask for geolocation, dim window
    navigator.geolocation.getCurrentPosition(function(position : Position) {
      var lat : number = position.coords.latitude;
      var long : number = position.coords.longitude;
      $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text=\"(" + lat + "," + long + ")\")&format=json&callback=?").done(geoLoaded);
    }, geoEx, {
      timeout: 8000
    });
  } else {
    geoEx(NO_GEO_EX);
  }
};