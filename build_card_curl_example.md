# Showdown Bot Card Generation API flow

Example build for Babe Ruth Card

```
curl 'https://www.showdownbot.com/api/build_image_for_card' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.6' \
  -H 'content-type: application/json' \
  -H 'origin: https://www.showdownbot.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.showdownbot.com/explore' \
  -H 'sec-ch-ua: "Brave";v="143", "Chromium";v="143", "Not A(Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-gpc: 1' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' \
  --data-raw '{"card":{"accolades":[".393 BA","AL MVP","AL HR LEADER","AL OBP LEADER","AL SLG LEADER","AL OPS LEADER","AL RBI LEADER","AL WALKS LEADER","AL RUNS LEADER","AL TOTAL BASES LEADER","AL WAR LEADER","2ND IN AL BA","3RD IN AL 2B","AL OPS+ LEADER","4TH IN AL HITS","5TH IN AL 3B","9TH IN AL SB"],"bref_id":"ruthba01","bref_url":"https://www.baseball-reference.com/players/r/ruthba01.shtml","build_on_init":true,"chart":{"accuracy":0.979,"accuracy_breakdown":{"command":{"accuracy":1,"actual":16,"adjustment_pct":1,"comparison":16,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.5},"onbase_perc":{"accuracy":0.9507829977628636,"actual":0.545,"adjustment_pct":1,"comparison":0.5725,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2377},"onbase_plus_slugging":{"accuracy":0.9606081030480043,"actual":1.309,"adjustment_pct":1,"comparison":1.3616,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0961},"overall":{"accuracy":0.979,"actual":1.309,"adjustment_pct":1,"comparison":1.3616,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.9676775481295473,"actual":0.764,"adjustment_pct":1,"comparison":0.7891,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1452}},"chart_categories_adjusted":[],"command":16,"command_accuracy_weight":1,"command_estimated":16,"command_out_accuracy_weight":1,"era":"LIVE BALL ERA","era_year_list":[1923],"is_baseline":false,"is_command_out_anomaly":true,"is_expanded":true,"is_pitcher":false,"is_wotc_conversion":false,"obp_adjustment_factor":1,"opponent":{"accuracy":1,"accuracy_breakdown":{},"chart_categories_adjusted":[],"command":3.7,"command_accuracy_weight":1,"command_out_accuracy_weight":1,"era":"LIVE BALL ERA","era_year_list":[2003],"is_baseline":true,"is_command_out_anomaly":false,"is_expanded":true,"is_pitcher":true,"is_wotc_conversion":false,"obp_adjustment_factor":0.973,"outs":16.103,"outs_full":17,"pa":400,"ranges":{"1B":"—","2B":"—","BB":"—","FB":"—","GB":"—","HR":"1+","PU":"—","SO":"—"},"results":{},"sb":0,"set":"2004","slot_values":{},"stats_per_400_pa":{},"values":{"1B":2.0486999999999984,"2B":0.5011,"3B":0.0585,"BB":1.2315,"FB":6.193448400000001,"GB":7.0317,"HR":0.057,"PU":0.9205516,"SO":1.9575}},"outs":3.9,"outs_full":4,"pa":400,"player_subtype":"position_player","ranges":{"1B":"13–16","1B+":"—","2B":"17–18","3B":"19","BB":"5–12","FB":"3–4","GB":"2","HR":"20+","SO":"1"},"results":{"1":"SO","2":"GB","3":"FB","4":"FB","5":"BB","6":"BB","7":"BB","8":"BB","9":"BB","10":"BB","11":"BB","12":"BB","13":"1B","14":"1B","15":"1B","16":"1B","17":"2B","18":"2B","19":"3B","20":"HR","21":"HR","22":"HR","23":"HR","24":"HR","25":"HR","26":"HR","27":"HR","28":"HR","29":"HR","30":"HR"},"sb":0,"set":"2004","slot_values":{"1":0.975,"2":0.975,"3":0.975,"4":0.975,"5":0.975,"6":0.975,"7":0.975,"8":0.975,"9":0.975,"10":0.975,"11":0.975,"12":0.975,"13":0.975,"14":0.975,"15":0.975,"16":0.975,"17":0.975,"18":0.975,"19":0.975,"20":0.975,"21":0.3333333333333333,"22":0.16666666666666666,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0},"stats_per_400_pa":{"1b_per_400_pa":60.6581,"2b_per_400_pa":25.7511,"3b_per_400_pa":7.4392,"G":152,"GO/AO":1.48,"IF/FB":0.08,"PA":400,"batting_avg":0.393,"bb_per_400_pa":99.5708,"fb_per_400_pa":47.4964,"gb_per_400_pa":76.1087,"h_per_400_pa":117.3104,"hr_per_400_pa":23.4621,"ibb_per_400_pa":0,"onbase_perc":0.545,"onbase_plus_slugging":1.309,"pct_of_400_pa":1.7475,"pu_per_400_pa":4.0057,"sb_per_400_pa":9.7282,"sf_per_400_pa":0,"sh_per_400_pa":1.7167,"slugging_perc":0.764,"so_per_400_pa":53.2189},"values":{"1B":3.9,"1B+":0,"2B":1.95,"3B":0.975,"BB":7.8,"FB":1.95,"GB":0.975,"HR":1.475,"SO":0.975}},"chart_version":1,"command_out_accuracies":{"10-0":0.6975,"11-0":0.7836,"12-0":0.8434,"13-1":0.9125,"13-2":0.8698,"14-2":0.9213,"14-3":0.9355,"15-3":0.9331,"15-4":0.9536,"16-4":0.979,"16-5":0.9715,"7-0":0.4313,"8-0":0.5354,"9-0":0.6224},"command_out_accuracy_breakdowns":{"10-0":{"command":{"accuracy":0.5834615384615385,"actual":16,"adjustment_pct":0.925,"comparison":10,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.2917},"onbase_perc":{"accuracy":0.8099256580269238,"actual":0.545,"adjustment_pct":1,"comparison":0.4504,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2025},"onbase_plus_slugging":{"accuracy":0.8122257970166716,"actual":1.309,"adjustment_pct":1,"comparison":1.0843,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0812},"overall":{"accuracy":0.6975,"actual":1.309,"adjustment_pct":1,"comparison":1.0843,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.8138636526217898,"actual":0.764,"adjustment_pct":1,"comparison":0.6339,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1221}},"11-0":{"command":{"accuracy":0.650925925925926,"actual":16,"adjustment_pct":0.925,"comparison":11,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.3255},"onbase_perc":{"accuracy":0.8953465920061787,"actual":0.545,"adjustment_pct":1,"comparison":0.4908,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2238},"onbase_plus_slugging":{"accuracy":0.9249395632703206,"actual":1.309,"adjustment_pct":1,"comparison":1.2143,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0925},"overall":{"accuracy":0.7836000000000001,"actual":1.309,"adjustment_pct":1,"comparison":1.2143,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.945546218487395,"actual":0.764,"adjustment_pct":1,"comparison":0.7235,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1418}},"12-0":{"command":{"accuracy":0.7135714285714285,"actual":16,"adjustment_pct":0.925,"comparison":12,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.3568},"onbase_perc":{"accuracy":0.9745424138251416,"actual":0.545,"adjustment_pct":1,"comparison":0.5313,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2436},"onbase_plus_slugging":{"accuracy":0.9725857662820414,"actual":1.309,"adjustment_pct":1,"comparison":1.2736,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0973},"overall":{"accuracy":0.8433999999999999,"actual":1.309,"adjustment_pct":1,"comparison":1.2736,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.9711876784173139,"actual":0.764,"adjustment_pct":1,"comparison":0.7423,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1457}},"13-1":{"command":{"accuracy":0.8344827586206897,"actual":16,"adjustment_pct":1,"comparison":13,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.4172},"onbase_perc":{"accuracy":0.9928695493189506,"actual":0.545,"adjustment_pct":1,"comparison":0.5489,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2482},"onbase_plus_slugging":{"accuracy":0.9895884789299692,"actual":1.309,"adjustment_pct":1,"comparison":1.3227,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.099},"overall":{"accuracy":0.9125,"actual":1.309,"adjustment_pct":1,"comparison":1.3227,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.9872545194433606,"actual":0.764,"adjustment_pct":1,"comparison":0.7738,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1481}},"13-2":{"command":{"accuracy":0.771896551724138,"actual":16,"adjustment_pct":0.925,"comparison":13,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.3859},"onbase_perc":{"accuracy":0.9648991784914114,"actual":0.545,"adjustment_pct":1,"comparison":0.5262,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2412},"onbase_plus_slugging":{"accuracy":0.9691257466449462,"actual":1.309,"adjustment_pct":1,"comparison":1.2692,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0969},"overall":{"accuracy":0.8698,"actual":1.309,"adjustment_pct":1,"comparison":1.2692,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.9721300597213006,"actual":0.764,"adjustment_pct":1,"comparison":0.743,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1458}},"14-2":{"command":{"accuracy":0.8933333333333333,"actual":16,"adjustment_pct":1,"comparison":14,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.4467},"onbase_perc":{"accuracy":0.9698201861389718,"actual":0.545,"adjustment_pct":1,"comparison":0.5617,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2425},"onbase_plus_slugging":{"accuracy":0.9405529612334148,"actual":1.309,"adjustment_pct":1,"comparison":1.3892,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0941},"overall":{"accuracy":0.9213,"actual":1.309,"adjustment_pct":1,"comparison":1.3892,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.920201068174678,"actual":0.764,"adjustment_pct":1,"comparison":0.8275,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.138}},"14-3":{"command":{"accuracy":0.8933333333333333,"actual":16,"adjustment_pct":1,"comparison":14,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.4467},"onbase_perc":{"accuracy":0.9842810910772075,"actual":0.545,"adjustment_pct":1,"comparison":0.5365,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2461},"onbase_plus_slugging":{"accuracy":0.9840097002766094,"actual":1.309,"adjustment_pct":1,"comparison":1.3301,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0984},"overall":{"accuracy":0.9355,"actual":1.309,"adjustment_pct":1,"comparison":1.3301,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.9619928094504366,"actual":0.764,"adjustment_pct":1,"comparison":0.7936,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1443}},"15-3":{"command":{"accuracy":0.9483870967741935,"actual":16,"adjustment_pct":1,"comparison":15,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.4742},"onbase_perc":{"accuracy":0.9558586039834919,"actual":0.545,"adjustment_pct":1,"comparison":0.5696,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.239},"onbase_plus_slugging":{"accuracy":0.9015107495642067,"actual":1.309,"adjustment_pct":1,"comparison":1.4446,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0902},"overall":{"accuracy":0.9331,"actual":1.309,"adjustment_pct":1,"comparison":1.4446,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.8645515558267236,"actual":0.764,"adjustment_pct":1,"comparison":0.875,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1297}},"15-4":{"command":{"accuracy":0.9483870967741935,"actual":16,"adjustment_pct":1,"comparison":15,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.4742},"onbase_perc":{"accuracy":0.9942957033765756,"actual":0.545,"adjustment_pct":1,"comparison":0.5419,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2486},"onbase_plus_slugging":{"accuracy":0.947119854226321,"actual":1.309,"adjustment_pct":1,"comparison":1.3801,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0947},"overall":{"accuracy":0.9536,"actual":1.309,"adjustment_pct":1,"comparison":1.3801,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.907377356135314,"actual":0.764,"adjustment_pct":1,"comparison":0.8382,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1361}},"16-4":{"command":{"accuracy":1,"actual":16,"adjustment_pct":1,"comparison":16,"is_pitcher":false,"notes":"OUTLIER","stat":"command","weight":0.5,"weighted_accuracy":0.5},"onbase_perc":{"accuracy":0.9507829977628636,"actual":0.545,"adjustment_pct":1,"comparison":0.5725,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2377},"onbase_plus_slugging":{"accuracy":0.9606081030480043,"actual":1.309,"adjustment_pct":1,"comparison":1.3616,"is_pitcher":false,"notes":"OUTLIER","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0961},"overall":{"accuracy":0.979,"actual":1.309,"adjustment_pct":1,"comparison":1.3616,"is_pitcher":false,"notes":"OUTLIER","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.9676775481295473,"actual":0.764,"adjustment_pct":1,"comparison":0.7891,"is_pitcher":false,"notes":"OUTLIER","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1452}},"16-5":{"command":{"accuracy":1,"actual":16,"adjustment_pct":1,"comparison":16,"is_pitcher":false,"notes":"","stat":"command","weight":0.5,"weighted_accuracy":0.5},"onbase_perc":{"accuracy":0.9952179510759609,"actual":0.545,"adjustment_pct":1,"comparison":0.5424,"is_pitcher":false,"notes":"","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.2488},"onbase_plus_slugging":{"accuracy":0.9233029679694387,"actual":1.309,"adjustment_pct":1,"comparison":1.4134,"is_pitcher":false,"notes":"","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0923},"overall":{"accuracy":0.9715,"actual":1.309,"adjustment_pct":1,"comparison":1.4134,"is_pitcher":false,"notes":"","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.8691131498470948,"actual":0.764,"adjustment_pct":1,"comparison":0.871,"is_pitcher":false,"notes":"","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1304}},"7-0":{"command":{"accuracy":0.34586956521739126,"actual":16,"adjustment_pct":0.925,"comparison":7,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.1729},"onbase_perc":{"accuracy":0.5060061777828624,"actual":0.545,"adjustment_pct":1,"comparison":0.3291,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.1265},"onbase_plus_slugging":{"accuracy":0.5211854376745728,"actual":1.309,"adjustment_pct":1,"comparison":0.8033,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0521},"overall":{"accuracy":0.43129999999999996,"actual":1.309,"adjustment_pct":1,"comparison":0.8033,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.5319011468260377,"actual":0.764,"adjustment_pct":1,"comparison":0.4742,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.0798}},"8-0":{"command":{"accuracy":0.4316666666666667,"actual":16,"adjustment_pct":0.925,"comparison":8,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.2158},"onbase_perc":{"accuracy":0.6161837069436851,"actual":0.545,"adjustment_pct":1,"comparison":0.3695,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.154},"onbase_plus_slugging":{"accuracy":0.6487493825497329,"actual":1.309,"adjustment_pct":1,"comparison":0.9179,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0649},"overall":{"accuracy":0.5354,"actual":1.309,"adjustment_pct":1,"comparison":0.9179,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.671441633648278,"actual":0.764,"adjustment_pct":1,"comparison":0.5484,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1007}},"9-0":{"command":{"accuracy":0.5105999999999999,"actual":16,"adjustment_pct":0.925,"comparison":9,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"command","weight":0.5,"weighted_accuracy":0.2553},"onbase_perc":{"accuracy":0.7172774869109946,"actual":0.545,"adjustment_pct":1,"comparison":0.41,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_perc","weight":0.25,"weighted_accuracy":0.1793},"onbase_plus_slugging":{"accuracy":0.7410587169420596,"actual":1.309,"adjustment_pct":1,"comparison":1.0089,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"onbase_plus_slugging","weight":0.1,"weighted_accuracy":0.0741},"overall":{"accuracy":0.6224000000000001,"actual":1.309,"adjustment_pct":1,"comparison":1.0089,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"overall","weight":0,"weighted_accuracy":1},"slugging_perc":{"accuracy":0.7577225034852153,"actual":0.764,"adjustment_pct":1,"comparison":0.5989,"is_pitcher":false,"notes":"OUTLIER, C/O ADJ: -7.5%","stat":"slugging_perc","weight":0.15,"weighted_accuracy":0.1137}}},"commands_excluded":[],"disable_cache_cleaning":false,"era":"LIVE BALL ERA","hand":"L","icons":["HR","V"],"ignore_cache":false,"image":{"add_one_to_set_year":false,"color_primary":"rgb(12, 35, 64)","color_secondary":"rgb(31, 77, 139)","coloring":"PRIMARY","edition":"NONE","expansion":"BS","glow_multiplier":1,"hide_team_logo":false,"is_bordered":false,"is_dark_mode":false,"parallel":"NONE","show_year_text":false,"source":{"type":"EMPTY"},"special_edition":"NONE","stat_highlights_list":["152 G",".393/.545/.764","14.1 bWAR","1.2 dWAR","13 3B","239 OPS+","41 HR","45 2B","130 RBI","205 H","17 SB"],"stat_highlights_type":"ALL"},"ip":0,"is_running_on_website":false,"is_stats_estimate":false,"is_variable_speed_00_01":false,"is_wotc":false,"league":"AL","load_time":0,"name":"Babe Ruth","nationality":"US","nicknames":[],"pct_rank":{},"player_id":"1923-ruthba01","player_sub_type":"position_player","player_type":"Hitter","points":890,"points_breakdown":{"allow_negatives":false,"breakdowns":{"AVERAGE":{"adjustment":-34.94,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"average","percentile":2.2657142857142856,"points":101.003,"possible_points":60,"value":0.4036,"value_range":{"max":0.315,"min":0.245}},"DEFENSE-OF":{"adjustment":0,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"defense","metric_category":"OF","percentile":1,"points":70,"possible_points":70,"value":2,"value_range":{"max":2,"min":0}},"HOME_RUNS":{"adjustment":-9.488,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"home_runs","percentile":0.820376,"points":27.429,"possible_points":45,"value":30.5094,"value_range":{"max":35,"min":10}},"ICON-HR":{"adjustment":0,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"icon","metric_category":"HR","percentile":1,"points":20,"possible_points":20,"value":1,"value_range":{"max":1,"min":0}},"ICON-V":{"adjustment":0,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"icon","metric_category":"V","percentile":1,"points":20,"possible_points":20,"value":1,"value_range":{"max":1,"min":0}},"ONBASE":{"adjustment":-99.051,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"onbase","percentile":2.2669565217391305,"points":286.332,"possible_points":170,"value":0.5607,"value_range":{"max":0.415,"min":0.3}},"SLUGGING":{"adjustment":-115.373,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"slugging","percentile":2.244444444444444,"points":333.516,"possible_points":200,"value":0.774,"value_range":{"max":0.55,"min":0.37}},"SPEED":{"adjustment":0,"command_multiplier":1,"ip_multiplier":1,"is_desc":false,"metric":"speed","percentile":0.5,"points":30,"possible_points":60,"value":15,"value_range":{"max":20,"min":10}}},"command_out_multiplier":1,"decay_rate":0.6,"decay_start":500,"ip_multiplier":1},"positions_and_defense":{"OF":2},"positions_and_defense_for_visuals":{"OF":2},"positions_and_defense_string":"OF +2","positions_and_games_played":{"OF":148},"positions_and_real_life_ratings":{"CF":{"dWAR":1.2},"LF":{"dWAR":1.2},"OF":{"dWAR":1.2},"RF":{"dWAR":1.2}},"positions_list":["OF"],"print_to_cli":false,"projected":{"1B":111.3944,"2B":48.6565,"3B":21.7441,"AB":511.7742,"BB":184.2259,"FB":125.2513,"G":152,"GB":115.5737,"H":214.2659,"HR":32.471,"IBB":0,"PA":699,"PU":12.3867,"SF":0,"SH":2.9999,"SO":47.2965,"batting_avg":0.4187,"g":152,"onbase_perc":0.5725,"onbase_plus_slugging":1.3616,"onbase_plus_slugging_plus":276,"slugging_perc":0.7891},"rank":{},"real_vs_projected_stats":[{"diff":0.026,"diff_str":"+.026","is_real_estimated":false,"precision":3,"projected":0.419,"real":0.393,"stat":"BA"},{"diff":0.028,"diff_str":"+.028","is_real_estimated":false,"precision":3,"projected":0.573,"real":0.545,"stat":"OBP"},{"diff":0.025,"diff_str":"+.025","is_real_estimated":false,"precision":3,"projected":0.789,"real":0.764,"stat":"SLG"},{"diff":0.053,"diff_str":"+.053","is_real_estimated":false,"precision":3,"projected":1.362,"real":1.309,"stat":"OPS"},{"diff":37,"diff_str":"+37","is_real_estimated":false,"projected":276,"real":239,"stat":"OPS+"},{"real":152,"stat":"G"},{"diff":0,"diff_str":"0","projected":699,"real":699,"stat":"PA"},{"diff":-10,"diff_str":"-10","projected":512,"real":522,"stat":"AB"},{"diff":5,"diff_str":"+5","projected":111,"real":106,"stat":"1B"},{"diff":4,"diff_str":"+4","projected":49,"real":45,"stat":"2B"},{"diff":9,"diff_str":"+9","projected":22,"real":13,"stat":"3B"},{"diff":-9,"diff_str":"-9","projected":32,"real":41,"stat":"HR"},{"diff":10,"diff_str":"+10","projected":184,"real":174,"stat":"BB"},{"diff":-46,"diff_str":"-46","projected":47,"real":93,"stat":"SO"},{"diff":-17,"diff_str":"-17","is_real_estimated":true,"projected":116,"real":133,"stat":"GB"},{"diff":42,"diff_str":"+42","is_real_estimated":true,"projected":125,"real":83,"stat":"FB"},{"diff":5,"diff_str":"+5","is_real_estimated":true,"projected":12,"real":7,"stat":"PU"},{"diff":0,"diff_str":"0","projected":0,"real":0,"stat":"SF"},{"real":17,"stat":"SB"},{"real":1.2,"stat":"dWAR"},{"real":14.1,"stat":"bWAR"},{"real":1.2,"stat":"DWAR-CF"},{"real":1.2,"stat":"DWAR-LF"},{"real":1.2,"stat":"DWAR-OF"},{"real":1.2,"stat":"DWAR-RF"}],"set":"2004","show_image":false,"speed":{"letter":"B","speed":15},"stats":{"1B":106,"2B":45,"3B":13,"AB":522,"BB":174,"CS":21,"FB":83.09,"G":152,"GB":133.68,"GIDP":0,"GO/AO":1.48,"H":205,"HBP":4,"HR":41,"IBB":0,"IF/FB":0.08,"PA":699,"PU":7.23,"R":151,"RBI":130,"SB":17,"SF":0,"SH":3,"SO":93,"TB":399,"accolades":{"2B":["1923 AL 45 (3RD)"],"3B":["1923 AL 13 (5TH)"],"BB":["1923 AL 170 (1ST)"],"H":["1923 AL 205 (4TH)"],"HR":["1923 AL 41 (1ST)"],"R":["1923 AL 151 (1ST)"],"RBI":["1923 AL 130 (1ST)"],"SB":["1923 AL 17 (9TH)"],"TB":["1923 AL 399 (1ST)"],"WAR":["1923 AL 14.1 (1ST)"],"awards":["1923 AL MVP"],"batting_avg":["1923 AL .393 (2ND)"],"mvp":["1923 AL (1, 100%)"],"onbase_perc":["1923 AL .545 (1ST)"],"onbase_plus_slugging":["1923 AL 1.309 (1ST)"],"onbase_plus_slugging_plus":["1923 AL 239 (1ST)"],"slugging_perc":["1923 AL .764 (1ST)"]},"age":28,"award_summary":"MVP-1","bWAR":"14.1","batting_avg":0.393,"bref_id":"ruthba01","bref_url":"https://www.baseball-reference.com/players/r/ruthba01.shtml","dWAR":"1.2","hand":"Left","hand_throw":"Left","is_above_hr_threshold":true,"is_above_sb_threshold":false,"is_above_so_threshold":false,"is_above_w_threshold":false,"is_hof":true,"is_hr_leader":true,"is_rookie":false,"is_sb_leader":false,"is_so_leader":true,"lg_ID":"AL","name":"Babe Ruth","nationality":"US","onbase_perc":0.545,"onbase_plus_slugging":1.309,"onbase_plus_slugging_plus":239,"outs_above_avg":{},"pos_season":"*97/83","positions":{"1B":{"drs":null,"g":4,"tzr":null},"CF":{"drs":null,"g":7,"tzr":null},"LF":{"drs":null,"g":67,"tzr":null},"OF":{"drs":null,"g":148,"tzr":null},"RF":{"drs":null,"g":73,"tzr":null}},"rookie_status_year":1915,"slugging_perc":0.764,"sprint_speed":null,"team_ID":"NYY","type":"Hitter","year_ID":1923,"years_played":["1914","1915","1916","1917","1918","1919","1920","1921","1922","1923","1924","1925","1926","1927","1928","1929","1930","1931","1932","1933","1934","1935"]},"stats_period":{"is_full_career":false,"is_multi_year":false,"source":"Unknown","type":"REGULAR","year":"1923","year_list":[1923]},"team":"NYY","version":"4.0","warnings":[],"year":"1923"}}'
  ```

  Response:
  ```
  {
    "card": {
        "accolades": [
            ".393 BA",
            "AL MVP",
            "AL HR LEADER",
            "AL OBP LEADER",
            "AL SLG LEADER",
            "AL OPS LEADER",
            "AL RBI LEADER",
            "AL WALKS LEADER",
            "AL RUNS LEADER",
            "AL TOTAL BASES LEADER",
            "AL WAR LEADER",
            "2ND IN AL BA",
            "3RD IN AL 2B",
            "AL OPS+ LEADER",
            "4TH IN AL HITS",
            "5TH IN AL 3B",
            "9TH IN AL SB"
        ],
        "bref_id": "ruthba01",
        "bref_url": "https://www.baseball-reference.com/players/r/ruthba01.shtml",
        "build_on_init": true,
        "chart": {
            "accuracy": 0.979,
            "accuracy_breakdown": {
                "command": {
                    "accuracy": 1.0,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 16.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.5
                },
                "onbase_perc": {
                    "accuracy": 0.9507829977628636,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5725,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2377
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9606081030480043,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3616,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0961
                },
                "overall": {
                    "accuracy": 0.979,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3616,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 1.0
                },
                "slugging_perc": {
                    "accuracy": 0.9676775481295473,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.7891,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1452
                }
            },
            "chart_categories_adjusted": [],
            "command": 16,
            "command_accuracy_weight": 1.0,
            "command_estimated": 16.0,
            "command_out_accuracy_weight": 1.0,
            "era": "LIVE BALL ERA",
            "era_year_list": [
                1923
            ],
            "is_baseline": false,
            "is_command_out_anomaly": true,
            "is_expanded": true,
            "is_pitcher": false,
            "is_wotc_conversion": false,
            "obp_adjustment_factor": 1.0,
            "opponent": {
                "accuracy": 1.0,
                "accuracy_breakdown": {},
                "chart_categories_adjusted": [],
                "command": 3.7,
                "command_accuracy_weight": 1.0,
                "command_out_accuracy_weight": 1.0,
                "era": "LIVE BALL ERA",
                "era_year_list": [
                    2003
                ],
                "is_baseline": true,
                "is_command_out_anomaly": false,
                "is_expanded": true,
                "is_pitcher": true,
                "is_wotc_conversion": false,
                "obp_adjustment_factor": 0.973,
                "outs": 16.103,
                "outs_full": 17,
                "pa": 400,
                "ranges": {
                    "1B": "\u2014",
                    "2B": "\u2014",
                    "BB": "\u2014",
                    "FB": "\u2014",
                    "GB": "\u2014",
                    "HR": "1+",
                    "PU": "\u2014",
                    "SO": "\u2014"
                },
                "results": {},
                "sb": 0.0,
                "set": "2004",
                "slot_values": {},
                "stats_per_400_pa": {},
                "values": {
                    "1B": 2.0486999999999984,
                    "2B": 0.5011,
                    "3B": 0.0585,
                    "BB": 1.2315,
                    "FB": 6.193448400000001,
                    "GB": 7.0317,
                    "HR": 0.057,
                    "PU": 0.9205516,
                    "SO": 1.9575
                }
            },
            "outs": 3.9,
            "outs_full": 4,
            "pa": 400,
            "player_subtype": "position_player",
            "ranges": {
                "1B": "13\u201316",
                "1B+": "\u2014",
                "2B": "17\u201318",
                "3B": "19",
                "BB": "5\u201312",
                "FB": "3\u20134",
                "GB": "2",
                "HR": "20+",
                "SO": "1"
            },
            "results": {
                "1": "SO",
                "10": "BB",
                "11": "BB",
                "12": "BB",
                "13": "1B",
                "14": "1B",
                "15": "1B",
                "16": "1B",
                "17": "2B",
                "18": "2B",
                "19": "3B",
                "2": "GB",
                "20": "HR",
                "21": "HR",
                "22": "HR",
                "23": "HR",
                "24": "HR",
                "25": "HR",
                "26": "HR",
                "27": "HR",
                "28": "HR",
                "29": "HR",
                "3": "FB",
                "30": "HR",
                "4": "FB",
                "5": "BB",
                "6": "BB",
                "7": "BB",
                "8": "BB",
                "9": "BB"
            },
            "sb": 0.0,
            "set": "2004",
            "slot_values": {
                "1": 0.975,
                "10": 0.975,
                "11": 0.975,
                "12": 0.975,
                "13": 0.975,
                "14": 0.975,
                "15": 0.975,
                "16": 0.975,
                "17": 0.975,
                "18": 0.975,
                "19": 0.975,
                "2": 0.975,
                "20": 0.975,
                "21": 0.3333333333333333,
                "22": 0.16666666666666666,
                "23": 0.0,
                "24": 0.0,
                "25": 0.0,
                "26": 0.0,
                "27": 0.0,
                "28": 0.0,
                "29": 0.0,
                "3": 0.975,
                "30": 0.0,
                "4": 0.975,
                "5": 0.975,
                "6": 0.975,
                "7": 0.975,
                "8": 0.975,
                "9": 0.975
            },
            "stats_per_400_pa": {
                "1b_per_400_pa": 60.6581,
                "2b_per_400_pa": 25.7511,
                "3b_per_400_pa": 7.4392,
                "G": 152.0,
                "GO/AO": 1.48,
                "IF/FB": 0.08,
                "PA": 400.0,
                "batting_avg": 0.393,
                "bb_per_400_pa": 99.5708,
                "fb_per_400_pa": 47.4964,
                "gb_per_400_pa": 76.1087,
                "h_per_400_pa": 117.3104,
                "hr_per_400_pa": 23.4621,
                "ibb_per_400_pa": 0.0,
                "onbase_perc": 0.545,
                "onbase_plus_slugging": 1.309,
                "pct_of_400_pa": 1.7475,
                "pu_per_400_pa": 4.0057,
                "sb_per_400_pa": 9.7282,
                "sf_per_400_pa": 0.0,
                "sh_per_400_pa": 1.7167,
                "slugging_perc": 0.764,
                "so_per_400_pa": 53.2189
            },
            "values": {
                "1B": 3.9,
                "1B+": 0,
                "2B": 1.95,
                "3B": 0.975,
                "BB": 7.8,
                "FB": 1.95,
                "GB": 0.975,
                "HR": 1.475,
                "SO": 0.975
            }
        },
        "chart_version": 1,
        "command_out_accuracies": {
            "10-0": 0.6975,
            "11-0": 0.7836,
            "12-0": 0.8434,
            "13-1": 0.9125,
            "13-2": 0.8698,
            "14-2": 0.9213,
            "14-3": 0.9355,
            "15-3": 0.9331,
            "15-4": 0.9536,
            "16-4": 0.979,
            "16-5": 0.9715,
            "7-0": 0.4313,
            "8-0": 0.5354,
            "9-0": 0.6224
        },
        "command_out_accuracy_breakdowns": {
            "10-0": {
                "command": {
                    "accuracy": 0.5834615384615385,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 10.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.2917
                },
                "onbase_perc": {
                    "accuracy": 0.8099256580269238,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.4504,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2025
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.8122257970166716,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.0843,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0812
                },
                "overall": {
                    "accuracy": 0.8122257970166716,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.0843,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.8138636526217898,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.6339,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1221
                }
            },
            "11-0": {
                "command": {
                    "accuracy": 0.650925925925926,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 11.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.3255
                },
                "onbase_perc": {
                    "accuracy": 0.8953465920061787,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.4908,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2238
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9249395632703206,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.2143,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0925
                },
                "overall": {
                    "accuracy": 0.9249395632703206,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.2143,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.945546218487395,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.7235,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1418
                }
            },
            "12-0": {
                "command": {
                    "accuracy": 0.7135714285714285,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 12.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.3568
                },
                "onbase_perc": {
                    "accuracy": 0.9745424138251416,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5313,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2436
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9725857662820414,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.2736,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0973
                },
                "overall": {
                    "accuracy": 0.9725857662820414,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.2736,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.9711876784173139,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.7423,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1457
                }
            },
            "13-1": {
                "command": {
                    "accuracy": 0.8344827586206897,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 13.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.4172
                },
                "onbase_perc": {
                    "accuracy": 0.9928695493189506,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5489,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2482
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9895884789299692,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3227,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.099
                },
                "overall": {
                    "accuracy": 0.9895884789299692,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3227,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.9872545194433606,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.7738,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1481
                }
            },
            "13-2": {
                "command": {
                    "accuracy": 0.771896551724138,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 13.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.3859
                },
                "onbase_perc": {
                    "accuracy": 0.9648991784914114,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5262,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2412
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9691257466449462,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.2692,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0969
                },
                "overall": {
                    "accuracy": 0.9691257466449462,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.2692,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.9721300597213006,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.743,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1458
                }
            },
            "14-2": {
                "command": {
                    "accuracy": 0.8933333333333333,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 14.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.4467
                },
                "onbase_perc": {
                    "accuracy": 0.9698201861389718,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5617,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2425
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9405529612334148,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3892,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0941
                },
                "overall": {
                    "accuracy": 0.9405529612334148,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3892,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.920201068174678,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.8275,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.138
                }
            },
            "14-3": {
                "command": {
                    "accuracy": 0.8933333333333333,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 14.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.4467
                },
                "onbase_perc": {
                    "accuracy": 0.9842810910772075,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5365,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2461
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9840097002766094,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3301,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0984
                },
                "overall": {
                    "accuracy": 0.9840097002766094,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3301,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.9619928094504366,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.7936,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1443
                }
            },
            "15-3": {
                "command": {
                    "accuracy": 0.9483870967741935,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 15.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.4742
                },
                "onbase_perc": {
                    "accuracy": 0.9558586039834919,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5696,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.239
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9015107495642067,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.4446,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0902
                },
                "overall": {
                    "accuracy": 0.9015107495642067,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.4446,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.8645515558267236,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.875,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1297
                }
            },
            "15-4": {
                "command": {
                    "accuracy": 0.9483870967741935,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 15.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.4742
                },
                "onbase_perc": {
                    "accuracy": 0.9942957033765756,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5419,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2486
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.947119854226321,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3801,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0947
                },
                "overall": {
                    "accuracy": 0.947119854226321,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3801,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.907377356135314,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.8382,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1361
                }
            },
            "16-4": {
                "command": {
                    "accuracy": 1.0,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 16.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.5
                },
                "onbase_perc": {
                    "accuracy": 0.9507829977628636,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5725,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2377
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9606081030480043,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3616,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0961
                },
                "overall": {
                    "accuracy": 0.9606081030480043,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.3616,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.9676775481295473,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.7891,
                    "is_pitcher": false,
                    "notes": "OUTLIER",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1452
                }
            },
            "16-5": {
                "command": {
                    "accuracy": 1.0,
                    "actual": 16.0,
                    "adjustment_pct": 1.0,
                    "comparison": 16.0,
                    "is_pitcher": false,
                    "notes": "",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.5
                },
                "onbase_perc": {
                    "accuracy": 0.9952179510759609,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5424,
                    "is_pitcher": false,
                    "notes": "",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.2488
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.9233029679694387,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.4134,
                    "is_pitcher": false,
                    "notes": "",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0923
                },
                "overall": {
                    "accuracy": 0.9233029679694387,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.4134,
                    "is_pitcher": false,
                    "notes": "",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.8691131498470948,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.871,
                    "is_pitcher": false,
                    "notes": "",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1304
                }
            },
            "7-0": {
                "command": {
                    "accuracy": 0.34586956521739126,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 7.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.1729
                },
                "onbase_perc": {
                    "accuracy": 0.5060061777828624,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.3291,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.1265
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.5211854376745728,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 0.8033,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0521
                },
                "overall": {
                    "accuracy": 0.5211854376745728,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 0.8033,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.5319011468260377,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.4742,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.0798
                }
            },
            "8-0": {
                "command": {
                    "accuracy": 0.4316666666666667,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 8.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.2158
                },
                "onbase_perc": {
                    "accuracy": 0.6161837069436851,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.3695,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.154
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.6487493825497329,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 0.9179,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0649
                },
                "overall": {
                    "accuracy": 0.6487493825497329,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 0.9179,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.671441633648278,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5484,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1007
                }
            },
            "9-0": {
                "command": {
                    "accuracy": 0.5105999999999999,
                    "actual": 16.0,
                    "adjustment_pct": 0.925,
                    "comparison": 9.0,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "command",
                    "weight": 0.5,
                    "weighted_accuracy": 0.2553
                },
                "onbase_perc": {
                    "accuracy": 0.7172774869109946,
                    "actual": 0.545,
                    "adjustment_pct": 1.0,
                    "comparison": 0.41,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_perc",
                    "weight": 0.25,
                    "weighted_accuracy": 0.1793
                },
                "onbase_plus_slugging": {
                    "accuracy": 0.7410587169420596,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.0089,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "onbase_plus_slugging",
                    "weight": 0.1,
                    "weighted_accuracy": 0.0741
                },
                "overall": {
                    "accuracy": 0.7410587169420596,
                    "actual": 1.309,
                    "adjustment_pct": 1.0,
                    "comparison": 1.0089,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "overall",
                    "weight": 0.0,
                    "weighted_accuracy": 0.0
                },
                "slugging_perc": {
                    "accuracy": 0.7577225034852153,
                    "actual": 0.764,
                    "adjustment_pct": 1.0,
                    "comparison": 0.5989,
                    "is_pitcher": false,
                    "notes": "OUTLIER, C/O ADJ: -7.5%",
                    "stat": "slugging_perc",
                    "weight": 0.15,
                    "weighted_accuracy": 0.1137
                }
            }
        },
        "commands_excluded": [],
        "disable_cache_cleaning": false,
        "era": "LIVE BALL ERA",
        "hand": "L",
        "icons": [
            "HR",
            "V"
        ],
        "ignore_cache": false,
        "image": {
            "add_one_to_set_year": false,
            "color_primary": "rgb(12, 35, 64)",
            "color_secondary": "rgb(31, 77, 139)",
            "coloring": "PRIMARY",
            "edition": "NONE",
            "expansion": "BS",
            "glow_multiplier": 1.0,
            "hide_team_logo": false,
            "is_bordered": false,
            "is_dark_mode": false,
            "output_file_name": "Babe Ruth-2026-01-07 20:29:05.518652.png",
            "output_folder_path": "static/output",
            "parallel": "NONE",
            "show_year_text": false,
            "source": {
                "type": "Google Drive"
            },
            "special_edition": "NONE",
            "stat_highlights_list": [
                "152 G",
                ".393/.545/.764",
                "14.1 bWAR",
                "1.2 dWAR",
                "13 3B",
                "239 OPS+",
                "41 HR",
                "45 2B",
                "130 RBI",
                "205 H",
                "17 SB"
            ],
            "stat_highlights_type": "ALL"
        },
        "ip": 0,
        "is_running_on_website": false,
        "is_stats_estimate": false,
        "is_variable_speed_00_01": false,
        "is_wotc": false,
        "league": "AL",
        "load_time": 4.65,
        "name": "Babe Ruth",
        "nationality": "US",
        "nicknames": [],
        "pct_rank": {},
        "player_sub_type": "position_player",
        "player_type": "Hitter",
        "points": 890,
        "points_breakdown": {
            "allow_negatives": false,
            "breakdowns": {
                "AVERAGE": {
                    "adjustment": -34.94,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "average",
                    "percentile": 2.2657142857142856,
                    "points": 101.003,
                    "possible_points": 60.0,
                    "value": 0.4036,
                    "value_range": {
                        "max": 0.315,
                        "min": 0.245
                    }
                },
                "DEFENSE-OF": {
                    "adjustment": 0.0,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "defense",
                    "metric_category": "OF",
                    "percentile": 1.0,
                    "points": 70.0,
                    "possible_points": 70.0,
                    "value": 2,
                    "value_range": {
                        "max": 2.0,
                        "min": 0.0
                    }
                },
                "HOME_RUNS": {
                    "adjustment": -9.488,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "home_runs",
                    "percentile": 0.820376,
                    "points": 27.429,
                    "possible_points": 45.0,
                    "value": 30.5094,
                    "value_range": {
                        "max": 35.0,
                        "min": 10.0
                    }
                },
                "ICON-HR": {
                    "adjustment": 0.0,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "icon",
                    "metric_category": "HR",
                    "percentile": 1.0,
                    "points": 20.0,
                    "possible_points": 20.0,
                    "value": 1,
                    "value_range": {
                        "max": 1.0,
                        "min": 0.0
                    }
                },
                "ICON-V": {
                    "adjustment": 0.0,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "icon",
                    "metric_category": "V",
                    "percentile": 1.0,
                    "points": 20.0,
                    "possible_points": 20.0,
                    "value": 1,
                    "value_range": {
                        "max": 1.0,
                        "min": 0.0
                    }
                },
                "ONBASE": {
                    "adjustment": -99.051,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "onbase",
                    "percentile": 2.2669565217391305,
                    "points": 286.332,
                    "possible_points": 170.0,
                    "value": 0.5607,
                    "value_range": {
                        "max": 0.415,
                        "min": 0.3
                    }
                },
                "SLUGGING": {
                    "adjustment": -115.373,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "slugging",
                    "percentile": 2.244444444444444,
                    "points": 333.516,
                    "possible_points": 200.0,
                    "value": 0.774,
                    "value_range": {
                        "max": 0.55,
                        "min": 0.37
                    }
                },
                "SPEED": {
                    "adjustment": 0.0,
                    "command_multiplier": 1.0,
                    "ip_multiplier": 1.0,
                    "is_desc": false,
                    "metric": "speed",
                    "percentile": 0.5,
                    "points": 30.0,
                    "possible_points": 60.0,
                    "value": 15,
                    "value_range": {
                        "max": 20.0,
                        "min": 10.0
                    }
                }
            },
            "command_out_multiplier": 1.0,
            "decay_rate": 0.6,
            "decay_start": 500,
            "ip_multiplier": 1.0
        },
        "positions_and_defense": {
            "OF": 2
        },
        "positions_and_defense_for_visuals": {
            "OF": 2
        },
        "positions_and_defense_string": "OF +2",
        "positions_and_games_played": {
            "OF": 148
        },
        "positions_and_real_life_ratings": {
            "CF": {
                "dWAR": 1.2
            },
            "LF": {
                "dWAR": 1.2
            },
            "OF": {
                "dWAR": 1.2
            },
            "RF": {
                "dWAR": 1.2
            }
        },
        "positions_list": [
            "OF"
        ],
        "print_to_cli": false,
        "projected": {
            "1B": 111.3944,
            "2B": 48.6565,
            "3B": 21.7441,
            "AB": 511.7742,
            "BB": 184.2259,
            "FB": 125.2513,
            "G": 152,
            "GB": 115.5737,
            "H": 214.2659,
            "HR": 32.471,
            "IBB": 0,
            "PA": 699,
            "PU": 12.3867,
            "SF": 0,
            "SH": 2.9999,
            "SO": 47.2965,
            "batting_avg": 0.4187,
            "g": 152,
            "onbase_perc": 0.5725,
            "onbase_plus_slugging": 1.3616,
            "onbase_plus_slugging_plus": 276,
            "slugging_perc": 0.7891
        },
        "rank": {},
        "real_vs_projected_stats": [
            {
                "diff": 0.026,
                "diff_str": "+.026",
                "is_real_estimated": false,
                "precision": 3,
                "projected": 0.419,
                "real": 0.393,
                "stat": "BA"
            },
            {
                "diff": 0.028,
                "diff_str": "+.028",
                "is_real_estimated": false,
                "precision": 3,
                "projected": 0.573,
                "real": 0.545,
                "stat": "OBP"
            },
            {
                "diff": 0.025,
                "diff_str": "+.025",
                "is_real_estimated": false,
                "precision": 3,
                "projected": 0.789,
                "real": 0.764,
                "stat": "SLG"
            },
            {
                "diff": 0.053,
                "diff_str": "+.053",
                "is_real_estimated": false,
                "precision": 3,
                "projected": 1.362,
                "real": 1.309,
                "stat": "OPS"
            },
            {
                "diff": 37.0,
                "diff_str": "+37",
                "is_real_estimated": false,
                "projected": 276.0,
                "real": 239,
                "stat": "OPS+"
            },
            {
                "real": 152,
                "stat": "G"
            },
            {
                "diff": 0.0,
                "diff_str": "0",
                "projected": 699.0,
                "real": 699,
                "stat": "PA"
            },
            {
                "diff": -10.0,
                "diff_str": "-10",
                "projected": 512.0,
                "real": 522,
                "stat": "AB"
            },
            {
                "diff": 5.0,
                "diff_str": "+5",
                "projected": 111.0,
                "real": 106,
                "stat": "1B"
            },
            {
                "diff": 4.0,
                "diff_str": "+4",
                "projected": 49.0,
                "real": 45,
                "stat": "2B"
            },
            {
                "diff": 9.0,
                "diff_str": "+9",
                "projected": 22.0,
                "real": 13,
                "stat": "3B"
            },
            {
                "diff": -9.0,
                "diff_str": "-9",
                "projected": 32.0,
                "real": 41,
                "stat": "HR"
            },
            {
                "diff": 10.0,
                "diff_str": "+10",
                "projected": 184.0,
                "real": 174,
                "stat": "BB"
            },
            {
                "diff": -46.0,
                "diff_str": "-46",
                "projected": 47.0,
                "real": 93,
                "stat": "SO"
            },
            {
                "diff": -17.0,
                "diff_str": "-17",
                "is_real_estimated": true,
                "projected": 116.0,
                "real": 133,
                "stat": "GB"
            },
            {
                "diff": 42.0,
                "diff_str": "+42",
                "is_real_estimated": true,
                "projected": 125.0,
                "real": 83,
                "stat": "FB"
            },
            {
                "diff": 5.0,
                "diff_str": "+5",
                "is_real_estimated": true,
                "projected": 12.0,
                "real": 7,
                "stat": "PU"
            },
            {
                "diff": 0.0,
                "diff_str": "0",
                "projected": 0.0,
                "real": 0,
                "stat": "SF"
            },
            {
                "real": 17,
                "stat": "SB"
            },
            {
                "real": 1.2,
                "stat": "dWAR"
            },
            {
                "real": 14.1,
                "stat": "bWAR"
            },
            {
                "real": 1.2,
                "stat": "DWAR-CF"
            },
            {
                "real": 1.2,
                "stat": "DWAR-LF"
            },
            {
                "real": 1.2,
                "stat": "DWAR-OF"
            },
            {
                "real": 1.2,
                "stat": "DWAR-RF"
            }
        ],
        "set": "2004",
        "show_image": false,
        "speed": {
            "letter": "B",
            "speed": 15
        },
        "stats": {
            "1B": 106,
            "2B": 45,
            "3B": 13,
            "AB": 522,
            "BB": 174,
            "CS": 21,
            "FB": 83.09,
            "G": 152,
            "GB": 133.68,
            "GIDP": 0,
            "GO/AO": 1.48,
            "H": 205,
            "HBP": 4,
            "HR": 41,
            "IBB": 0,
            "IF/FB": 0.08,
            "PA": 699,
            "PU": 7.23,
            "R": 151,
            "RBI": 130,
            "SB": 17,
            "SF": 0,
            "SH": 3,
            "SO": 93,
            "TB": 399,
            "accolades": {
                "2B": [
                    "1923 AL 45 (3RD)"
                ],
                "3B": [
                    "1923 AL 13 (5TH)"
                ],
                "BB": [
                    "1923 AL 170 (1ST)"
                ],
                "H": [
                    "1923 AL 205 (4TH)"
                ],
                "HR": [
                    "1923 AL 41 (1ST)"
                ],
                "R": [
                    "1923 AL 151 (1ST)"
                ],
                "RBI": [
                    "1923 AL 130 (1ST)"
                ],
                "SB": [
                    "1923 AL 17 (9TH)"
                ],
                "TB": [
                    "1923 AL 399 (1ST)"
                ],
                "WAR": [
                    "1923 AL 14.1 (1ST)"
                ],
                "awards": [
                    "1923 AL MVP"
                ],
                "batting_avg": [
                    "1923 AL .393 (2ND)"
                ],
                "mvp": [
                    "1923 AL (1, 100%)"
                ],
                "onbase_perc": [
                    "1923 AL .545 (1ST)"
                ],
                "onbase_plus_slugging": [
                    "1923 AL 1.309 (1ST)"
                ],
                "onbase_plus_slugging_plus": [
                    "1923 AL 239 (1ST)"
                ],
                "slugging_perc": [
                    "1923 AL .764 (1ST)"
                ]
            },
            "age": 28,
            "award_summary": "MVP-1",
            "bWAR": "14.1",
            "batting_avg": 0.393,
            "bref_id": "ruthba01",
            "bref_url": "https://www.baseball-reference.com/players/r/ruthba01.shtml",
            "dWAR": "1.2",
            "hand": "Left",
            "hand_throw": "Left",
            "is_above_hr_threshold": true,
            "is_above_sb_threshold": false,
            "is_above_so_threshold": false,
            "is_above_w_threshold": false,
            "is_hof": true,
            "is_hr_leader": true,
            "is_rookie": false,
            "is_sb_leader": false,
            "is_so_leader": true,
            "lg_ID": "AL",
            "name": "Babe Ruth",
            "nationality": "US",
            "onbase_perc": 0.545,
            "onbase_plus_slugging": 1.309,
            "onbase_plus_slugging_plus": 239,
            "outs_above_avg": {},
            "pos_season": "*97/83",
            "positions": {
                "1B": {
                    "drs": null,
                    "g": 4,
                    "tzr": null
                },
                "CF": {
                    "drs": null,
                    "g": 7,
                    "tzr": null
                },
                "LF": {
                    "drs": null,
                    "g": 67,
                    "tzr": null
                },
                "OF": {
                    "drs": null,
                    "g": 148,
                    "tzr": null
                },
                "RF": {
                    "drs": null,
                    "g": 73,
                    "tzr": null
                }
            },
            "rookie_status_year": 1915,
            "slugging_perc": 0.764,
            "sprint_speed": null,
            "team_ID": "NYY",
            "type": "Hitter",
            "year_ID": 1923,
            "years_played": [
                "1914",
                "1915",
                "1916",
                "1917",
                "1918",
                "1919",
                "1920",
                "1921",
                "1922",
                "1923",
                "1924",
                "1925",
                "1926",
                "1927",
                "1928",
                "1929",
                "1930",
                "1931",
                "1932",
                "1933",
                "1934",
                "1935"
            ]
        },
        "stats_period": {
            "is_full_career": false,
            "is_multi_year": false,
            "source": "Unknown",
            "type": "REGULAR",
            "year": "1923",
            "year_list": [
                1923
            ]
        },
        "team": "NYY",
        "version": "4.0",
        "warnings": [],
        "year": "1923"
    }
}
```

In the JSON there is a nested `output_file_name` and `output_file_path` property that is the key to retrieval. 