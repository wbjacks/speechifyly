# speechifyly
## Application for making your favorite public figures speak silly soundbites.

### How it works
speechifyly pulls transcripts from online videos of public figures, parsing out the
individual words from the transcripts and storing them as video clips. When you type in a
sentence from a selection of availble words for that speaker, speechifyly stitches the
clips together to stream a video of the figure saying your sentence.

### TODO
A test version of speechifyly is currently hosted on [Heroku](speechifyly.herokuapp.com)
- The database of video clips needs to be populated. There is currently a branch open for this.
- Should use some form of DSP to clip from the transcript, rather than simple linear
interpolation. Many DSP libraries exist specifically for speech parsing.
- Alternatively, we could use IBM's Watson to parse the transcripts.
