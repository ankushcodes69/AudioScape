<div align="center">
    <img src="./res/logo512.png" width="256" height="256" style="display: block; margin: 0 auto"/>
    <h1>AudioScape</h1>
    <p>AudioScape is a command-line tool that allows users to download a song, retrieve synced lyrics, and play the song along with the synchronized lyrics display. This project is implemented using Python.</p>
    
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/ankushcodes69/Music-Player-With-Synced-Lyrics/main?style=flat&labelColor=black&label=Last%20Commit&color=39ff14)
![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/t/ankushcodes69/Music-Player-With-Synced-Lyrics?style=flat&labelColor=black&label=Total%20Commits&color=ff3131)
![GitHub language count](https://img.shields.io/github/languages/count/ankushcodes69/Music-Player-With-Synced-Lyrics?style=flat&label=Languages%20Used&labelColor=black&color=1f51ff)
![GitHub issues](https://img.shields.io/github/issues/ankushcodes69/Music-Player-With-Synced-Lyrics?style=flat&labelColor=black&label=Issues&color=ff3131)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ankushcodes69/Music-Player-With-Synced-Lyrics?style=flat&labelColor=black&label=Pull%20Requests&color=39ff14)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ankushcodes69/Music-Player-With-Synced-Lyrics?style=flat&labelColor=black&label=Code%20Size&color=1f51fc)
</div>

## ⚙️ Features

- Download songs.
- Retrieve synced lyrics for the selected song.
- Play the song with synchronized lyrics display.


### 📜 Prerequisites

- [Git](https://git-scm.com/downloads) installed on your machine.
- [Python](https://www.python.org/downloads) installed on your machine.
- [Ffmpeg](https://ffmpeg.org/download.html) installed on your machine. (Choose Your OS And Install Any Build)

> [!Important]
**_Also Don't Forget To Add To Path All Of These Programs_**  
(Usually There Is A Add To Path Check Box During Installation, Just Check It And If You Forgot To Do So Just Watch A Tutorial On YouTube On How To Add Any Of These Programs To PATH)

### 🛠️ Getting Started (New Installation)

1. Open Termial On Your Device And Clone the repository:

   ```sh
   git clone https://github.com/ankushcodes69/AudioScape.git
   ```

2. Navigate to the project directory:

   ```sh
   cd AudioScape
   ```

3. Setup Python Virtual Environment (Optional but recommended. You can skip this and go to next step):

   - Step 1:

      - On Linux / MacOS:
         ```sh
         python3 -m venv env
         ```

      - On Windows:
         ```sh
         python -m venv env
         ```

   - Step 2:

      - On Linux / MacOS:
         ```sh
         source env/bin/activate
         ```

      - On Windows:
         ```sh
         .\env\Scripts\activate
         ```

4. Install required packages for python:

   ```sh
   pip install -r requirements.txt
   ```

5. Run the main.py file using Python:

   ```sh
   python main.py
   ```
   
6. Follow the on-screen instructions to:

    - Enter the name of the song you want to download.
    - Enjoy the song with synced lyrics!

### 💡 Usage
1. Activate Python Virtual Environment (If You Have Setup Python Virtual Environment During First Installation)
 
   - On Linux / MacOS:
       ```sh
       source env/bin/activate
       ```
     
   - On Windows:
       ```sh
       .\env\Scripts\activate
       ```
     
2. Run the main.py file using Python:

   ```sh
   python main.py
   ```

## To-Do List:
- [x] Implement basic functionality.
- [x] Download songs in webm format.
- [x] Retrieve and display synced lyrics.
- [x] Play the song with synchronized lyrics display.
- [x] Give This Project/App An Actual Name.
- [x] Switch To Complete Python Backend.
- [x] Use Better Api For Lyrics (lrclib.net)
- [x] Add Simple GUI Using Kivy.
- [ ] Make GUI Much Better And Colourful.
- [ ] Ability To Use YouTube Video Or Playlist Link.
- [ ] Ability To Download Songs And Stream Offline With Lyrics.
- [ ] Improve error handling.
- [ ] Enhance user interface.
