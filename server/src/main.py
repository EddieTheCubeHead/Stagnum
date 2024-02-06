import os

import uvicorn

if __name__ == "__main__":
    uvicorn.run("api.application:create_app",
                host=os.getenv("HOST", default="127.0.0.1"),
                port=int(os.getenv("PORT", default="8000")),
                reload=bool(os.getenv("RELOAD", "True")),
                factory=True)
