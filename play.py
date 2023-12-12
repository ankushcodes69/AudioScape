import vlc
import time

def play_mp3(file_path):
    # Creating VLC instance
    instance = vlc.Instance()

    # Creating a MediaPlayer with the given file path
    player = instance.media_player_new()
    media = instance.media_new(file_path)
    player.set_media(media)

    # Start playing
    player.play()

    # Wait for the playback to finish (you can remove this if you want non-blocking behavior)
    while player.get_state() != vlc.State.Ended:
        time.sleep(1)

    # Clean up
    player.stop()

# Replace 'path/to/your/file.mp3' with the actual path to your MP3 file
mp3_file_path = 'song.mp3'

# Play the MP3 file
play_mp3(mp3_file_path)