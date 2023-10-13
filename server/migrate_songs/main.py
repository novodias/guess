import os
from os import listdir
from os.path import isfile, join
import json
from yt_dlp import YoutubeDL

songs_path = './musics'
if not os.path.exists(songs_path):
    os.makedirs(songs_path)

file = open('data.json')
songs: dict[str, object] = json.load(file)

yt_url = "https://www.youtube.com/watch?v={0}"

URLS = []

# song: id, song_name, youtube_id, title_id, name (title_name)
for song in songs: 
    video_url = yt_url.format(song["youtube_id"])
    URLS.append(video_url)
    
print("{0} urls added to array".format(len(URLS)))

if len(URLS) != 0:
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a'
        }],
        'outtmpl': os.path.join(songs_path, "%(id)s.%(ext)s")
    }
    
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download(URLS)
        
def first_or_default(iterable, value):
    if not isinstance(value, str):
        return None
    
    for i in iterable:
        if value.startswith(i['youtube_id']):
            return i
    
    return None

# just noticed how this is dumb.
# it would be better to just use the song id LOL
song_str_format = '{0}_{1}.{2}'

songs_downloaded = [f for f in listdir(songs_path) if isfile(join(songs_path, f))]
for song_file in songs_downloaded:
    song = first_or_default(songs, song_file)
    
    if song == None:
        continue
    
    ext = song_file.split('.')[1]
    name = song["name"].replace(' ', "-").lower()
    song_name = song["song_name"].replace(' ', "-").lower()
    
    title_dir = join(songs_path, name)
    if not os.path.exists(title_dir):
        os.makedirs(title_dir)
    
    oldpath = join(songs_path, song_file)
    newpath = join(title_dir, song_str_format.format(name, song_name, ext))
    
    print("{0} -> {1}".format(oldpath, newpath))
    os.rename(oldpath, newpath)

    
file.close()