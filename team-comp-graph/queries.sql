 -- okay, for this viz we need the following:
 -- NODES: metadata for each hero, like name, id, number of appearances, etc
 -- EDGES: co-occurence data
 
 -- nodes are relatievly easy, we can just draw from other queries we've used
 
select herodisp.hero_num, hero_name, count(*) as picks, sum(gpm)/count(*) as gpm, sum(kills)/count(*) as kills, sum(deaths)/count(*) as deaths, sum(assists)/count(*) as assists, (sum(kills)+sum(assists))/sum(deaths) as kda, (sum(kills)/sum(deaths)) as kd into outfile '/tmp/hero_nodes.csv' FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' from bs_info join herodisp on bs_info.hero_num = herodisp.hero_num join mymatch on mymatch.id=bs_info.id join basic_stats2 on basic_stats2.id=bs_info.id and basic_stats2.index=bs_info.index group by hero_num;


 -- edges are trickier. going to basically ignore SQL for this one, since
 -- it's hard. so basically we're just going to dump mymatches into a CSV and
 -- deal with it all in JS.  