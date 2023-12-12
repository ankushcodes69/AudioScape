const { PythonShell } = require('python-shell');
const fs = require('fs');
const readline = require('readline');
const mp3 = require("youtube-mp3-downloader");
const ffmpeg = require("ffmpeg-static");
const YTMusic = require("ytmusic-api").default;

function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const options = {
    mode: 'text',
    scriptPath: '.',
    encoding: 'utf-8',
};

const input = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

console.warn = function () { };

var showLyrics = true;

async function main() {
    var song;
    await input.question('Enter Song Name Along With Artist: ', async (s) => {
        song = await s;
        console.log('Downloading Song...');
        await downloadMp3(song);
        console.log('Getting Lyrics...');
        await getLyrics(song);
        await delay(1000);
        console.log('Here We Go...');
        await playSongAndPrintLyrics();
    });
}

main();

async function playSongAndPrintLyrics() {
    const aiScript = './play.py';
    let lyricsData = JSON.parse(fs.readFileSync('./lyricsData.json'));
    const pyShell = new PythonShell(aiScript, options);
    var flag = true;

    pyShell.on('close', () => {
        flag = false;
        process.exit(0);
    });

    if (showLyrics == true) {
        let i = 0;
        var time = 0;
        while (flag && i < lyricsData.length) {
            await delay((lyricsData[i].time - time) * 1000);
            console.log(lyricsData[i].line);
            time = lyricsData[i].time;
            i++;
        }
    }
}

async function lrcToJson() {
    const lyricsFilePath = 'lyrics.lrc';
    const lyricsDataPath = 'lyricsData.json';
    fs.writeFileSync(lyricsDataPath, '[]', 'utf-8');

    const fileStream = fs.createReadStream(lyricsFilePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    rl.on('line', async (line) => {
        var existingData = JSON.parse(fs.readFileSync(lyricsDataPath));
        var data = { "time": timeStringToSeconds(line.substring(line.indexOf('[') + 1, line.indexOf(']'))), "line": line.substring(line.indexOf(']') + 2) };
        existingData.push(data);
        fs.writeFileSync(lyricsDataPath, JSON.stringify(existingData, null, 2));
    });

    function timeStringToSeconds(timeString) {
        try {
            const [minutes, secondsAndMilliseconds] = timeString.split(':');
            const [seconds, milliseconds] = secondsAndMilliseconds.split('.');

            const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseFloat(`0.${milliseconds}`);

            return totalSeconds.toFixed(2);
        } catch (err) {
            console.log("Couldn't Find The Lyrics So Song Will Be Played Without Lyrics");
            showLyrics = false;
            return 0;
        }
    }
}

async function getLyrics(song) {
    const pyShell = await new PythonShell('./lyrics.py', options);

    await pyShell.send(song);

    await new Promise((resolve) => pyShell.on('close', resolve));

    await lrcToJson();
}

async function downloadMp3(song) {
    const yd = await new mp3({
        ffmpegPath: ffmpeg,
        outputPath: "./",
        youtubeVideoQuality: "highestaudio",
    });

    var jsondata;

    const ytmusic = new YTMusic();
    await ytmusic.initialize().then(async () => {
        await ytmusic.searchSongs(song).then(async (songs) => {
            jsondata = songs;
        });
    });

    const ytdata = jsondata;
    const ytId = ytdata[0].videoId;
    yd.download(ytId, "song.mp3")

    await new Promise((resolve) => yd.on("finished", resolve));
}