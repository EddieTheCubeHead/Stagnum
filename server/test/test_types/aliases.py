import httpx

type MockResponseQueue = list[httpx.Response]
type SpotifySecrets = (str, str)
