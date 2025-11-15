# app/middlewares/cors.py
from fastapi.middleware.cors import CORSMiddleware

def setup(app):
    """
    Apply CORS middleware to the FastAPI app.
    """
    app.add_middleware(
        CORSMiddleware,
        # Explicit origins are required when allow_credentials=True
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
