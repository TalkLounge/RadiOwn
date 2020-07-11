## Tables
PK = Primary Key
AI = Auto Increment
MI = Multi-Entry
U = Unique

### Users
id        | userId                      | userName
--------- | --------------------------- | ------------
int PK AI | String(25) U                | String(25)
1         | "89784hfh78sehgh4he78sgh4f" | "TalkLounge"
2         | "eff8w8389a8w9f89wfw8f8jwa" | "lernpvp"

### Tags
users-id | tagId  | tag
-------- | ------ | -----
int PK   | int PK | String(25)
1        | 1      | "Trap Jam"
1        | 2      | "Trap"
1        | 3      | "Chill Musik"
2        | 1      | "Trap"
2        | 2      | "Chill"

### Channels
id        | channelId                  | channelName
--------- | -------------------------- | -----------
int PK AI | String(24) U               | String(18)
1         | "UCbZlA0boq37EvUslU767DBA" | "Trap Nation"
2         | "hfw89hf89wh8fh8hw8hf8hef" | "Tom Spander"
3         | "fwjf89jfjjfj8je8fjjefjee" | "Ehrling"

### Songs
users-id | songId | tags-tagId | channels-id | videoId       | artist        | title       | start | end | added
-------- | ------ | ---------- | ----------- | ------------- | ------------- | ----------- | ----- | --- | -----
int PK   | int PK | Array MI   | int         | String(11)    | String(25)    | String(25)  | int   | int | Date
1        | 1      | [1, 2]     | 1           | "hg76fhs-x2h" | "Illenium"    | "Alone"     | 0     | 300 | 187
1        | 2      | [3]        | 2           | "8fs98es8f88" | "Tom Spander" | "High"      | 30    | 330 | 567
2        | 1      | [1]        | 1           | "fhefhwhffhf" | "Audiovista"  | "Black"     | 25    | 290 | 876
2        | 2      | [2]        | 3           | "asfjwjjfj9f" | "Ehrling"     | "Feel good" | 5     | 180 | 435