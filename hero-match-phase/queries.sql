
 -- lets take this slow.
 -- first, lets get out match times and look at the distribution
 
select avg(match_time), max(match_time), min(match_time), stddev(match_time) from mymatch;


  -- now lets try to get that data for each hero.
  -- so we want a row for every time a hero is played, with match time in it
  -- this gets a row for every pick with winner properly set and match times.
  -- I'm not sure how index and winner are mapped; it could be backwards. 
  -- check with martin.
  select mymatch.id as matchid, bs_info.index, hero_name, match_time, (bs_info.index < 5 && winner=2) or (bs_info.index >= 5 && winner=3) as winner from bs_info join herodisp on bs_info.hero_num = herodisp.hero_num join mymatch on mymatch.id=bs_info.id join basic_stats2 on basic_stats2.id=bs_info.id and basic_stats2.index=bs_info.index limit 100;