import os
from pytube import YouTube
import requests
from moviepy.editor import *
import re
import time
import vlc
import threading
import YouTubeMusicAPI

def search_song(song_name):
    print('Searching Song...')

    result = YouTubeMusicAPI.search(song_name)

    if result:
        return result['url']
    else:
        return "null"


def download_song(youtube_url, output_folder):
    print('Downloading Song...')
   
    yt = YouTube(youtube_url)
    audio = yt.streams.filter(only_audio=True).first()
    out_file = audio.download(output_folder)

    base, ext = os.path.splitext(out_file)

    video = AudioFileClip(os.path.join(output_folder, out_file))
    video.write_audiofile(os.path.join(output_folder, f"{base}.mp3"), verbose=False, logger=None)

    os.remove(os.path.join(output_folder, out_file))

    return os.path.join(output_folder, f"{base}.mp3")


def get_song_info(youtube_url):
    print('Getting Song Info...')

    yt = YouTube(youtube_url)

    artist_name = yt.author
    track_name = yt.title
    album_name = "null"
    duration = yt.length

    return artist_name, track_name, album_name, duration


def get_synced_lyrics(artist_name, track_name, album_name, duration):
    print('Getting Lyrics...')

    params = {
        'artist_name': artist_name,
        'track_name': track_name,
        'album_name': album_name,
        'duration': duration
    }

    response = requests.get('https://lrclib.net/api/get', params=params)

    if response.status_code == 200:
        data = response.json()
        return data['syncedLyrics']
    else:
        return "Failed to retrieve synced lyrics. Status code: {}".format(response.status_code)


def parse_lrc(lrc_data):
    lyrics = {}
    lines = lrc_data.split('\n')
    for line in lines:
        match = re.match(r'\[(\d+):(\d+\.\d+)\](.*)', line)
        if match:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            time = minutes * 60 + seconds
            text = match.group(3).strip()
            lyrics[time] = text
            
    return lyrics


def print_lyrics(lyrics):
    timestamps = sorted(lyrics.keys())
    start_time = 0
    for timestamp in timestamps:
        time.sleep(timestamp - start_time)
        if(lyrics[timestamp] == "" or lyrics[timestamp] == " "):
            print('♪')
        else:
            print(lyrics[timestamp])
        start_time = timestamp


def play_mp3(file_path):
    print('Here We Go...')

    instance = vlc.Instance()

    player = instance.media_player_new()
    media = instance.media_new(file_path)
    player.set_media(media)

    player.play()

    while player.get_state() != vlc.State.Ended:
        time.sleep(1)

    player.stop()


def main():
    song_name = input('Enter Song Name Along With Artist: ')
    output_folder = "./MP3"

    video_url = search_song(song_name)
    
    if(video_url != "null"):
        song_path = download_song(video_url, output_folder)

        artist_name, track_name, album_name, duration = get_song_info(video_url)
        
        api_response = get_synced_lyrics(artist_name, track_name, album_name, duration)
        
        lyrics = parse_lrc(api_response)
        
        print_lyrics_thread = threading.Thread(target=print_lyrics, args=(lyrics,))
        play_mp3_thread = threading.Thread(target=play_mp3, args=(song_path,))

        print_lyrics_thread.start()
        play_mp3_thread.start()

        print_lyrics_thread.join()
        play_mp3_thread.join()


if __name__ == "__main__":
    main()