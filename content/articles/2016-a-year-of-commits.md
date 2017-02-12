I use Git almost every day. About a year ago, I played with the idea of **taking a selfie for every git push**. I ended up using the CLI tool `imagesnap` that lets you take a picture with your webcam (on Mac). To seamlessly blend it into my workflow, I added the command to my `gp` alias:

```bash
alias gp='git push && imagesnap ~/Dropbox/git_snapshots/$(date +"%m-%d-%yT%H:%M").jpg'
```

Sitting here one year later, I am enjoying every picture. They help me recall moments from throughout the year - from the joyful to the stressful.

I am happy to present my 2016 in a GIF!

<img class="media__center" src="/frontend/dist/images/2016.gif" />
