import os
from dotenv import dotenv_values
from flask import Flask, make_response, request, abort, jsonify
from os import listdir
from os.path import isfile, join
from yt_dlp import YoutubeDL
# from markupsafe import escape

config = dotenv_values('.env')
music_dir = config.get("MUSIC_DIRECTORY")
local_temp_songs = "./temp_songs"

if not os.path.exists(local_temp_songs):
    os.makedirs(local_temp_songs)

if music_dir == None:
    raise Exception("Environment key MUSIC_DIRECTORY must be set")

app = Flask(__name__)

def less_than_ten_minutes(info, *, incomplete):
    duration = info.get('duration')
    if duration and duration > 10 * 60:
        return 'The video is too long'

yt_url = "https://www.youtube.com/watch?v={0}"
ydl_opts = {
    # 'format': 'm4a/bestaudio/best',
    'format': 'ba[abr>50]',
    'format-sort': '+size,ext',
    'prefer-free-formats': True,
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'm4a'
    }],
    'match-filter:': less_than_ten_minutes,
    'outtmpl': join(local_temp_songs, "%(id)s.%(ext)s")
}

def convert_to_seconds(array: list[str]):
    length = len(array)
    # hh:mm:ss
    # 0(1):1(2):2(3)
    seconds = int(array[length - 1])
    minutes = int(array[length - 2]) if length > 1 else 0
    # doesn't need because of 'match-filter'
    # hours = int(array[length - 3]) if length > 2 else 0
    return minutes * 60 + seconds

def duration_in_seconds(text: str):
    split = text.split(':')
    
    if len(split) == 0:
        return 0
    elif len(split) == 1:
        return int(text)
    else:
        return convert_to_seconds(split)

def try_download(id):
    url = yt_url.format(id)
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return duration_in_seconds(info["duration_string"])
    
def get_file(id):
    # list = [f for f in listdir(local_temp_songs) if isfile(join(local_temp_songs, f))]
    for f in listdir(local_temp_songs):
        if isfile(join(local_temp_songs, f)) and f.startswith(id):
            return f
    
    return None

# def filter_name(name: str):
#     return name.replace(' ', "-").replace(':', "").replace("'", "").lower()

def move_file(file_name, new_file_name, title_path):
    file = get_file(file_name)
    
    if file is None:
        raise Exception("File was not found")
    
    local_song = join(local_temp_songs, file)
    
    # 0-name 1-ext
    song_format = "{0}.{1}"
    
    ext = file.split('.')[1]
    final_name = song_format.format(new_file_name, ext)
    title_dir = join(music_dir, title_path)
    
    if not os.path.exists(title_dir):
        os.makedirs(title_dir)
    
    final_path = join(title_dir, final_name)
    os.rename(local_song, final_path)
    
    app.logger.info("{0} -> {1}".format(local_song, final_path))


@app.route("/")
def index():
    return "<p>Service downloader online</p>"

@app.route("/fetch", methods=["POST"])
def fetch():
    data = request.json
    
    if data is None:
        abort(400)
    
    title_dir_name = data['title_name']
    song_file_name = data['song_name']
    youtube_id = data['youtube_id']
    
    duration = try_download(youtube_id)
    
    try:
        move_file(youtube_id, song_file_name, title_dir_name)
    except Exception as e:
        print("Move file not successful: " + str(e))
        abort(500)
        
    res_data = {
        "partial_path": '{0}/{1}'.format(title_dir_name, song_file_name),
        "duration": duration
    }
    
    response = make_response(jsonify(res_data))
    response.status_code = 201
    return response