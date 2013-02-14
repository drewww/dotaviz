var fs = require('fs')
    _ = require('underscore')._;
    


// select herodisp.hero_num, hero_name, count(*) as picks, sum(gpm)/count(*) as gpm, sum(kills)/count(*) as kills, sum(deaths)/count(*) as deaths, sum(assists)/count(*) as assists, (sum(kills)+sum(assists))/sum(deaths) as kda, (sum(kills)/sum(deaths)) as kd

var heroes = {}
fs.readFile('hero_nodes.csv', function(err, data) {
  lines = data.toString("ascii").split("\n");
  console.log("lines: " + lines.length);
  _.each(lines, function(line) {
    var pieces = line.split(",")

    var entry = {heroId: parseInt(pieces[0]), heroName: pieces[1], picks: parseInt(pieces[2]), gpm: parseFloat(pieces[3]), kills: parseFloat(pieces[4]), deaths: parseFloat(pieces[5]), assists: parseFloat(pieces[6]), kda: parseFloat(pieces[7]), kd:parseFloat(pieces[8])};
    heroes[entry.heroId] = entry;
  });
  
  console.log(JSON.stringify(heroes));
});
