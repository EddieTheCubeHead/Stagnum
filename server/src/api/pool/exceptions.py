class QueueNotEmptyException(Exception):

    def __init__(self):
        message = ("Songs detected in Spotify queue! Please ensure your queue is empty by skipping in Spotify until "
                   "the player repeats one song. Then reset Stagnum playback status by skipping a song in Stagnum. We "
                   "are sorry for the inconvenience, Spotify does not offer tools for us to do this automatically.")
        super().__init__(message)
