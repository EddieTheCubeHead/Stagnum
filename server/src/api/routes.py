from api.application import application


@application.get("/")
async def root():
    return {"message": "Hello World!"}
