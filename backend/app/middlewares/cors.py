# app/middlewares/cors.py
from fastapi.middleware.cors import CORSMiddleware

def setup(app):
    """
    Apply CORS middleware to the FastAPI app.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "https://hiremate-phi.vercel.app",
        ],
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.ngrok-free\.app)(:[0-9]+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
