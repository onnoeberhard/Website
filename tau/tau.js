var lights = null;
var latlng = null;
var ip = null;

var map;
var map_ready = false;

var conn = window.location.href.endsWith("local");

const URL = conn ? "http://tau.onnoeberhard.com/index.php?a=" : "/tau/local/";

function getLights(notify) {
    $.ajax({
        url: URL + "get_lights",
        dataType: conn ? 'jsonp' : 'json',
        timeout: 2000,
        success: function (res) {
            notify ? jsonLightsDone(res, true) : jsonLights(res);
        },
        error: function () {
            notify ? jsonLightsDone(null, false) : jsonLights(null);
        }
    });
    if (notify && map !== null) myMap();
    else if (map_ready) {
        google.maps.event.trigger(map, "resize");
        map.setCenter(new google.maps.LatLng(20, 10));
        map.setZoom(2);
    }
    getLogStats();
}

function jsonLights(data) {
    $("#loading").hide();
    var reload = $("#reload");
    reload.show();
    if (map !== null && (data === null || data.result === null)) {
        $(".noconn").show();
        $(".withconn").hide();
    } else {
        lights = data.result;
        for (var i = 0; i < lights.length; i++)
            setLight(i, lights[i] === "1");
        $(".noconn").hide();
        $(".withconn").show();
    }
    if (!conn) {
        reload.hide();
    }
}

function jsonLightsDone(data, success) {
    jsonLights(data);
    toast(success ? "Done!" : "No Connection!");
}

function setLight(i, state) {
    lights = lights.substr(0, i) + (state ? "1" : "0") + lights.substr(i + 1);
    var src = "/tau/img/bulb-";
    switch (i) {
        case 0:
        case 5:
            src += "red" + (!state ? "-off" : "");
            break;
        case 1:
        case 6:
            src += "orange" + (!state ? "-off" : "");
            break;
        case 2:
        case 7:
            src += "yellow" + (!state ? "-off" : "");
            break;
        case 3:
        case 8:
            src += "green" + (!state ? "-off" : "");
            break;
        case 4:
        case 9:
            src += "blue" + (!state ? "-off" : "");
            break;
    }
    $("#light-" + (i + 1).toString()).attr('src', src + ".png");
}

function pushLights() {
    if (conn && lights !== null)
        $.ajax({
            url: URL + "push_lights&l=" + lights +
            (latlng !== null ? "&p=" + latlng : "") + (ip !== null ? "&ip=" + ip : ""),
            dataType: 'jsonp',
            success: function () {
                getLogStats();
                myMap();
            }
        });
}

function toggle(i) {
    setLight(i, lights[i] === "0");
    pushLights();
}

function toast(message) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerHTML = message;
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 2000);
}

function getIpLoc() {
    if (conn) {
        $.ajax({
            url: "https://freegeoip.net/json/",
            dataType: 'jsonp',
            success: function (json) {
                var data = JSON.parse(JSON.stringify(json));
                ip = data["ip"];
                latlng = data["latitude"] + "," + data["longitude"];
            },
            complete: function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            latlng = position.coords.latitude + "," + position.coords.longitude;
                        });
                }
            }
        });
    }
}

function myMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(20, 10),
        scrollwheel: false,
        zoom: 2,
        streetViewControl: false
    });
    google.maps.event.addListenerOnce(map, 'idle', function () {
        map_ready = true;
        getLights(false);
    });
    $.ajax({
        url: URL + "get_map",
        dataType: conn ? 'jsonp' : 'json',
        success: function (json) {
            for (var i = 0; i < json.length; i++) {
                var latlng = json[i].latlng.split(',');
                new google.maps.Marker({
                    position: new google.maps.LatLng(latlng[0], latlng[1]),
                    map: map,
                    icon: json[i].color === "red" ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png" :
                        json[i].color === "orange" ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" :
                            json[i].color === "yellow" ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png" :
                                json[i].color === "green" ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" :
                                    json[i].color === "blue" ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" :
                                        "https://maps.google.com/mapfiles/marker_white.png"
                });
            }
            google.maps.event.trigger(map, "resize");
            map.setCenter(new google.maps.LatLng(20, 10));
            map.setZoom(2);
        }
    });
}

var charts_ready = false;
var stats = null;

function getLogStats() {
    $.ajax({
        url: URL + "get_log_stats",
        dataType: conn ? 'jsonp' : 'json',
        success: function (json) {
            var logs = json['logs'];
            var log = $("#log");
            log.html("");
            for (var i = 0; i < logs.length; i++) {
                log.html(log.html() + (i > 0 ? "<br/>" : "") + logs[i].timestamp + "&gt; <span style='color: " +
                    logs[i].color + "'>" + logs[i].value + "</span>" + (logs[i].city !== "" ? " from " + logs[i].city : ""));
            }
            stats = json['stats'];
            if (charts_ready) charts();
        }
    });
}

function charts() {
    charts_ready = true;
    if (stats !== null) {
        console.log(stats);
        var colors = [['Color', 'Count']];
        var cities = [['City', 'People', 'Count']];
        for (var i = 0; i < stats.length; i++) {
            if (stats[i].type === "color")
                colors.push([stats[i].name, parseInt(stats[i].value)]);
            else if (stats[i].type === "city")
                cities.push([stats[i].name, parseInt(stats[i].count), parseInt(stats[i].value)]);
        }
        for (i = 0; i < cities.length; i++)
            while (cities[i][0].substr(0, 1) === " " || cities[i][0].substr(0, 1) === ",")
                cities[i][0] = cities[i][0].substr(1);
        console.log(cities.length);
        console.log(colors);
        var data = google.visualization.arrayToDataTable(colors);
        var options = {
            legend: 'none',
            slices: [
                {color: colors[1][0]},
                {color: colors[2][0]},
                {color: colors[3][0]},
                {color: colors[4][0]},
                {color: colors[5][0]}
            ],
            tooltip: {
                text: 'value',
                showColorCode: true
            },
            pieSliceText: 'none'
        };
        new google.visualization.PieChart(document.getElementById('colorchart')).draw(data, options);
        data = google.visualization.arrayToDataTable(cities);
        options = {
            showRowNumber: true,
            width: '100%'
        };
        new google.visualization.Table(document.getElementById('citychart')).draw(data, options);
    }
}

$(".noconn").hide();
$(".withconn").hide();
$("#reload").hide();
getLights(false);

if (conn) {
    var conlink = $("#conlink");
    conlink.prop("href", "/tau");
    conlink.html("Disconnect");
    getIpLoc();
} else {
    $("#light_notice").html("You are not connected and can't change the lights.")
}
