var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
var timer = 0;

function init()
{
	setInterval(update, 1000); //uses var timer as pseudo multi-threader
}

function update()
{ 
	//update weather every second, battery every min, loc every hour
	updateClock();
	if (timer % 60 == 0)
	{
		updateBattery();
		if (timer % 3600 == 0)
		{
			updateLocation();
		}
	}
	timer++;
}

function updateClock()
{
	var d = new Date();
	var dayOfMonth = d.getDate();
	var dayOfWeek = days[d.getDay()];
	var month = months[d.getMonth()];
	var hour = d.getHours();
	var minute = d.getMinutes();
	var period = ""
	
	//add leading zero if minute 0-9 or hour 0-9
	if (minute < 10)
	{
		minute.toString();
		minute = "0" + minute;
	};
	if (hour < 10)
	{
		hour.toString();
		hour = "0" + hour;
	};
	//12h clock functionality
	if (clock == "12h")
	{
		if (hour < 12)
		{
			period = "am";
		}
		else
		{
			period = "pm";
		}
		hour %= 12;
		if (hour == 0)
		{
			hour = 12;
		}
	}
	
	document.getElementById("time").innerHTML = hour + ":" + minute;
	document.getElementById("date").innerHTML = dayOfWeek + '<br>' + month + " " + dayOfMonth;
	document.getElementById("period").innerHTML = period;
}

function loadDoc(url, cFunction)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (xhttp.readyState == 4)
		{
			cFunction(xhttp.responseText);
		}
	}
	xhttp.open("GET", url, true);
	xhttp.send();
}

function updateBattery()
{
	loadDoc("file:///private/var/mobile/Library/BatteryStats.txt", displayBattery);
}

function displayBattery(data)
{
	var level = data.split('\n')[0].split(':')[1];
	var percent = level/100;
	document.getElementById("battery").innerHTML = (level || "XX") + '%' + " battery";
	canv = document.getElementById("battsym");
	ctx = canv.getContext("2d");
	ctx.clearRect(0, 0, canv.width, canv.height);
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 1;
	drawCircle(canv.width/2, canv.height/2, 10, 1.5*Math.PI, -0.5*Math.PI, true);
	ctx.strokeStyle = "white";
	ctx.lineWidth = 3;
	drawCircle(canv.width/2, canv.height/2, 10, 1.5*Math.PI, 1.5*Math.PI-2*Math.PI*percent, true);
	
	if (!level)
	{
		document.getElementById("debug").innerHTML += "Download InfoStats2 (or InfoStats) for battery information.<br>"
	}
}

function drawCircle(x, y, r, sAngle, eAngle, counterclockwise)
{
	ctx.beginPath();
	ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
	ctx.stroke();
	ctx.closePath();
}

function updateLocation()
{
	if (apikey)
	{
		if (zip)
		{
			loadDoc("http://api.openweathermap.org/data/2.5/weather?zip=" + zip + ',' + country + "&APPID=" + apikey + "&units=" + units, displayWeather);
		}
		else if (city)
		{
			loadDoc("http://api.openweathermap.org/data/2.5/weather?q=" + city + ',' + country + "&APPID=" + apikey + "&units=" + units, displayWeather);
		}
		else
		{
			document.getElementById("debug").innerHTML += "Include city or zip code in Config.js!<br>";
		}
	}
	else
	{
		document.getElementById("debug").innerHTML += "Include APIkey in Config.js!<br>";
	}
}

function displayWeather(data)
{
	var weather = JSON.parse(data);
	//typo fix
	if (weather.name == "Chantham-Kent")
	{
		weather.name == "Chatham-Kent";
	}
	//replace space with underscore in weather, matches img file names
	var state = weather.weather[0].description.replace(' ', '_');
	//day or night?
	var unix = Date.now().toString().substring(0,10); //truncate to 10 digits (format of openweathermap api)
	var day = unix > weather.sys.sunrise && unix < weather.sys.sunset ? "day" : "night";
	
	document.getElementById("weather").innerHTML = Math.round(weather.main.temp) + "°C"
	document.getElementById("state").innerHTML = weather.weather[0].description;
	document.getElementById("location").innerHTML = weather.name;
	var icon = document.getElementById("icon");
	icon.src = "res/imgs/white/" + state + '_' + day + ".png";
	//remove day tag if icon is neutral
	icon.onerror = function() 
	{
		this.src = "res/imgs/white/" + state + ".png";
	}
}