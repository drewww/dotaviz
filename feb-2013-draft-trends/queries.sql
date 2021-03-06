
+-----------+-----------------------+------+-----+---------+-------+
| Field     | Type                  | Null | Key | Default | Extra |
+-----------+-----------------------+------+-----+---------+-------+
| id        | int(10) unsigned      | NO   | PRI | NULL    |       |
| index     | tinyint(3) unsigned   | NO   | PRI | NULL    |       |
| player    | mediumint(9)          | YES  |     | NULL    |       |
| hero_num  | tinyint(4)            | NO   |     | NULL    |       |
| level     | smallint(5) unsigned  | YES  |     | NULL    |       |
| kills     | smallint(10)          | NO   |     | NULL    |       |
| deaths    | smallint(10)          | NO   |     | NULL    |       |
| assists   | smallint(5) unsigned  | NO   |     | NULL    |       |
| tot_gold  | mediumint(8) unsigned | NO   |     | NULL    |       |
| lh        | smallint(5) unsigned  | NO   |     | NULL    |       |
| denies    | smallint(5) unsigned  | NO   |     | NULL    |       |
| xpm       | float(5,1) unsigned   | YES  |     | NULL    |       |
| gpm       | float(5,1) unsigned   | NO   |     | NULL    |       |
| item_list | text                  | NO   |     | NULL    |       |
| eff       | float(4,2) unsigned   | NO   |     | NULL    |       |
| g_assists | smallint(5) unsigned  | NO   |     | NULL    |       |
| dmg       | mediumint(8) unsigned | NO   |     | NULL    |       |
| heal      | mediumint(8) unsigned | NO   |     | NULL    |       |
| stuns     | float(6,2) unsigned   | YES  |     | NULL    |       |
| slows     | float(6,2) unsigned   | YES  |     | NULL    |       |
| build_dmg | mediumint(8) unsigned | NO   |     | NULL    |       |
| runes     | smallint(5) unsigned  | NO   |     | NULL    |       |
| dmg_taken | mediumint(9)          | NO   |     | NULL    |       |
| standin   | tinyint(4)            | YES  |     | NULL    |       |
| role      | varchar(11)           | YES  |     | NULL    |       |
+-----------+-----------------------+------+-----+---------+-------+
25 rows in set (0.01 sec)


-- we need to take the table above and turn it into a new table.
-- it should have:
--    date of match
--    player
--    hero_num 


-- actually I really just need to merge match data into the basicstats table.
-- just:

select * from basicstats join mymatch on mymatch.id=basicstats.id;

-- from there I could do more elaborate processing if I so desired. that would
-- basically be grouping by date ranges and hero_num


-- shows aggregate picks
select herodisp.hero_num, hero_name, count(*) as picks from basicstats join herodisp on basicstats.hero_num = herodisp.hero_num group by hero_num order by picks desc;

select mymatch.id as matchid, herodisp.hero_num, hero_name, yearweek(date) as yearweek, gpm, role, kills, deaths, assists, month(date) as month, year(date) as year, monthname(date) as monthname from bs_info join herodisp on bs_info.hero_num = herodisp.hero_num join mymatch on mymatch.id=bs_info.id join basic_stats2 on basic_stats2.id=bs_info.id and basic_stats2.index=bs_info.index limit 100;

-- now group by date
select herodisp.hero_num, hero_name, count(*) as picks, yearweek(date) as yearweek, sum(gpm) as gpm, role, sum(kills), sum(deaths), sum(assists), month(date) as month, year(date) as year, monthname(date) as monthname into outfile '/tmp/hero_picks.csv' FIELDS TERMINATED BY ','LINES TERMINATED BY '\n' from bs_info join herodisp on bs_info.hero_num = herodisp.hero_num join mymatch on mymatch.id=bs_info.id join basic_stats2 on basic_stats2.id=bs_info.id and basic_stats2.index=bs_info.index group by hero_num, yearweek order by yearweek asc, picks desc;

-- the above query only has listings for heroes that were picked in that 
-- week, so there are no 0s in the data. We need precisely the same
-- number of data points per hero, so we need a complete list 


-- shows the hero/role mapping
select basicstats.hero_num, hero_name, role from basicstats join herodisp on herodisp.hero_num = basicstats.hero_num group by hero_num

-- shows hero/role mapping with added GPM bonus, sorted by gpm to show how it lines up
select basicstats.hero_num, hero_name, avg(gpm) as avg_gpm, role from basicstats join herodisp on herodisp.hero_num = basicstats.hero_num group by hero_num order by avg_gpm
