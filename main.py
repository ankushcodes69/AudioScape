import os
import threading
import vlc
import requests
import re
import time
from pytube import YouTube
from kivy.app import App
from kivy.lang import Builder
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.config import Config
from kivy.core.text import LabelBase
from moviepy.editor import AudioFileClip
import YouTubeMusicAPI


Builder.load_file('app.kv')

LabelBase.register(name='OpenSans', 
                   fn_regular='./fonts/OpenSans-Regular.ttf')

class AudioScape(BoxLayout):
    def play_song(self):
        song_name = self.ids.song_input.text
        output_folder = "./MP3"

        video_url = self.search_song(song_name)
        
        if video_url != "null":
            song_path = self.download_song(video_url, output_folder)

            artist_name, track_name, duration = self.get_song_info(video_url)
            
            api_response = self.get_synced_lyrics(artist_name, track_name, duration)
            
            lyrics = self.parse_lrc(api_response)
            
            self.ids.lyrics_label.text = ''
            
            print_lyrics_thread = threading.Thread(target=self.print_lyrics, args=(lyrics,))
            play_mp3_thread = threading.Thread(target=self.play_mp3, args=(song_path,))

            print_lyrics_thread.start()
            play_mp3_thread.start()

    def search_song(self, song_name):
        print('Searching Song...')
        result = YouTubeMusicAPI.search(song_name)

        if result:
            return result['url']
        else:
            return "null"

    def download_song(self, youtube_url, output_folder):
        print('Downloading Song...')
        yt = YouTube(youtube_url)
        audio = yt.streams.filter(only_audio=True).first()
        out_file = audio.download(output_folder)

        base, ext = os.path.splitext(out_file)

        video = AudioFileClip(os.path.join(output_folder, out_file))
        video.write_audiofile(os.path.join(output_folder, f"{base}.mp3"), verbose=False, logger=None)

        os.remove(os.path.join(output_folder, out_file))

        return os.path.join(output_folder, f"{base}.mp3")

    def get_song_info(self, youtube_url):
        print('Getting Song Info...')
        yt = YouTube(youtube_url)

        artist_name = yt.author
        track_name = yt.title
        duration = yt.length

        return artist_name, track_name, duration

    def get_synced_lyrics(self, artist_name, track_name, duration):
        print('Getting Lyrics...')
        params = {
            'artist_name': artist_name,
            'track_name': track_name
        }

        response = requests.get('https://lrclib.net/api/search', params=params)

        if response.status_code == 200:
            data = response.json()
            for lyricsData in data:
                if duration == lyricsData['duration'] :
                    return lyricsData['syncedLyrics']
            return "null"
        else:
            return "Failed to retrieve synced lyrics. Status code: {}".format(response.status_code)

    def parse_lrc(self, lrc_data):
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

    def print_lyrics(self, lyrics):
        app = App.get_running_app()
        timestamps = sorted(lyrics.keys())
        start_time = 0
        for timestamp in timestamps:
            time.sleep(timestamp - start_time)
            if(lyrics[timestamp] == ''):
                app.update_lyrics('\u266A')
            else:
                app.update_lyrics(lyrics[timestamp])
            start_time = timestamp

    instance = vlc.Instance()
    player = instance.media_player_new() 

    def play_mp3(self, file_path):
        print('Here We Go...')

        media = self.instance.media_new(file_path)
        self.player.set_media(media)
        self.player.play()

        while self.player.get_state() != vlc.State.Ended:
            time.sleep(1)

        self.player.stop()

class AudioScapeApp(App):
    def build(self):
        return AudioScape()

    def update_lyrics(self, text):
        self.root.ids.lyrics_label.text = text

    def on_stop(self):
        self.root.player.stop()

if __name__ == "__main__":
    AudioScapeApp().run()
