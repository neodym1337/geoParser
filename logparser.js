var fs = require('fs');
var GeoJSON = require('geojson');

var parseId = "47aa81226890e056";
var outputFilename = 'geo.json';


var coordinates = [];

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);

      var splitted = line.split(" ");
      var deviceIDUnformat = splitted[0];
      var deviceID = deviceIDUnformat.substring(0, deviceIDUnformat.length - 1);

      if (deviceID === parseId) {
          var latUnformat = splitted[1];
          var lat = latUnformat.substring(0, latUnformat.length - 1);


          var lngUnformat = splitted[2];
          var lng = lngUnformat.substring(0, lngUnformat.length - 1);

          var coordinate = [lng, lat];
          coordinates.push(coordinate);
          //console.log("line");

      }

      last = index + 1;
      func(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);

      //console.log("Finished parsing");

    }
    console.log("Finished parsing");
    processData(coordinates);
  });
}

function func(data) {
  //console.log('Line: ' + data);
}

function processData(coordinates) {
    console.log("Process to geojson");
    var data = [{
        "name" : parseId,
        "line" : coordinates
    }];

    GeoJSON.parse(data, {'LineString' : 'line'}, function(geojson){
      //console.log(JSON.stringify(geojson));
      writeGeojsonToFile(geojson);
    });
};

function writeGeojsonToFile(geojson) {
    fs.writeFile(outputFilename, JSON.stringify(geojson, null, 4), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + outputFilename);
        }
    });
}

var input = fs.createReadStream('positionLogs.txt');
readLines(input, func);
