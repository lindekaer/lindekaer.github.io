
I found myself having to convert a bunch of audio files from `mp3` to `mp4` with FFmpeg while keeping the filename identical.
Using the Bash feature of **parameter expansion**, I ended up with a small concise snippet.

```bash
for i in *; ffmpeg -i $i "${i%.*}.mp4"
```

The file whole filename is available in `$i`, and with parameter expansion I am able to remove everything after the `.` character and subsequently append the correct file extension. You can dig more into parameter expansion [here](http://mywiki.wooledge.org/BashFAQ/073).

Happy hacking.
