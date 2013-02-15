var fs = require('fs')
    _ = require('underscore')._;
    


// select herodisp.hero_num, hero_name, count(*) as picks, sum(gpm)/count(*) as gpm, sum(kills)/count(*) as kills, sum(deaths)/count(*) as deaths, sum(assists)/count(*) as assists, (sum(kills)+sum(assists))/sum(deaths) as kda, (sum(kills)/sum(deaths)) as kd

var heroes = {}
fs.readFile('hero_nodes.csv', function(err, data) {
  lines = data.toString("ascii").split("\n");
  console.log("lines: " + lines.length);
  _.each(lines, function(line) {
    var pieces = line.split(",");

    var entry = {heroId: parseInt(pieces[0]), heroName: pieces[1], picks: parseInt(pieces[2]), gpm: parseFloat(pieces[3]), kills: parseFloat(pieces[4]), deaths: parseFloat(pieces[5]), assists: parseFloat(pieces[6]), kda: parseFloat(pieces[7]), kd:parseFloat(pieces[8]), pickedWith:{}, pickedAgainst:{}, wonWith: {}};
    heroes[entry.heroId] = entry;
  });
  
  
  // now load in the games data.
  var matches = {}
  fs.readFile('all_picks.csv', function(err, data) {
    lines = data.toString("ascii").split("\n");
    
    var pick;
    _.each(lines, function(line) {
      var pieces = line.split(",");
      
      pick = {matchId: parseInt(pieces[0]), index:parseInt(pieces[1]), heroId:parseInt(pieces[2]), winner:pieces[3]=="1"};
      
      if(!(pick.matchId in matches)) {
        matches[pick.matchId] = [];
      }
      matches[pick.matchId][pick.index] = pick;
    });
    
    // now we get to the fun part. how much graph functionality do we need here?
    // to start with, we want to link heroIds to lists of other heroIds they
    // have been picked with. data structure for that will be a dict:
    // key is heroId
    // contains a dict that has {sameTeam:{heroId->number of coOccurences}}
    // we'll add in other stuff later (like wins/losses, and enemies)
    _.each(matches, function(picks) {
      console.log("--------------------");
      
      console.log("picks: " + _.pluck(picks, "heroId"));
      
      _.each(picks, function(pick) {
        var heroToUpdate = heroes[pick.heroId];
        
        var teamIds = [];
        var enemyIds = [];
        var startIndex;
        var stopIndex;
        var enemyStartIndex;
        var enemyStopIndex;
        
        if(pick.index < 5) {
          startIndex = 0;
          stopIndex = 5;
          enemyStartIndex = 5;
          enemyStopIndex = 10;
        } else {
          startIndex = 5;
          stopIndex = 10;
          enemyStartIndex = 0;
          enemyStopIndex = 5;
        }
        
        for(var i=startIndex; i<stopIndex; i++) {
          if(i==pick.index) continue;        
          teamIds.push(picks[i].heroId);
        }
        
        for(var i=enemyStartIndex; i<enemyStopIndex; i++) {
          if(i==pick.index) continue;
          enemyIds.push(picks[i].heroId);
        }
        
        console.log("updating hero ("+pick.index+"): " + heroToUpdate.heroId + " with teammates: " + JSON.stringify(teamIds));
        
        updatePickedWith(heroToUpdate.heroId, teamIds, "pickedWith");
        updatePickedWith(heroToUpdate.heroId, enemyIds, "pickedAgainst");
        
        if(pick.winner) updatePickedWith(heroToUpdate.heroId, teamIds, "wonWith");
        
        
      });
    });

    console.log("==========================");
    console.log("=         SUMMARY        =");
    console.log("==========================");

    _.each(heroes, function(hero) {
      console.log("=======================");
      console.log("HERO: " + hero.heroName);
      
      
      _.each(["pickedWith","wonWith","pickedAgainst", ], function(key) {
        console.log("-------  "+key+"  --------")

        var connections = hero[key];

        // ugh, so pickedWith is an object, so it's not sortable. so convert.
        var connectionsList = _.map(connections, function(picks, id) {
          return {heroId:id, picks:picks};
        });

        connectionsList = _.sortBy(connectionsList, "picks");

        for(var i=connectionsList.length-1; i>=0; i--) {
          var item = connectionsList[i];

          console.log(item.picks + "  " + heroes[item.heroId].heroName);
        }
      })
    });
  });
});


function updatePickedWith(heroId, linkedIds, key) {
  var heroToUpdate = heroes[heroId];
  
  _.each(linkedIds, function(heroId) {
    if(!(heroId in heroToUpdate[key])) {
      heroToUpdate[key][heroId] = 0;
    } 
    
    heroToUpdate[key][heroId] = heroToUpdate[key][heroId]+1;
  });
  
  heroes[heroId] = heroToUpdate;
}