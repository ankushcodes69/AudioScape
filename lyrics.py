import syncedlyrics

song = input();

syncedlyrics.search(song, allow_plain_format=False, save_path="lyrics.lrc")