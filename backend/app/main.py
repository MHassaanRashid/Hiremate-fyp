from fastapi import FastAPI
from app.middlewares import cors
from app.routers import (
    auth,
    candidate_management,
    candidates,
    dashboard,
    interviews,
    interviewer,
    profile,
    resume_router as resume,
    applications,
    settings,
    jobs,
)

# Initialize FastAPI app
app = FastAPI(title="HireMate Backend")

# Setup CORS
cors.setup(app)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(candidate_management.router, prefix="/api/candidate-management", tags=["Candidate Management"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(interviewer.router, prefix="/api/interviewer", tags=["Interviewer"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(settings.router, prefix="/api/candidate/settings", tags=["Candidate Settings"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])

# Root endpoint
@app.get("/")
def root():
    return {"message": "HireMate Backend running!"}


# Entry point for local run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="localhost", port=3001, reload=True)
