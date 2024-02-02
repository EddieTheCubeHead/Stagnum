from typing import Annotated

from fastapi import Depends

from database.database_connection import ConnectionManager


class SpotifyClientRaw:
    pass


SpotifyClient = Annotated[SpotifyClientRaw, Depends()]


DatabaseConnection = Annotated[ConnectionManager, Depends()]
