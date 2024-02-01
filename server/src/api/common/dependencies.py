from typing import Annotated

from fastapi import Depends


class SpotifyClientRaw:
    pass


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]
