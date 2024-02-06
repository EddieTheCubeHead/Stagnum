from pydantic import BaseModel


class NamedResource(BaseModel):
    name: str
    link: str
