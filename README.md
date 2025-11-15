<<<<<<< HEAD
HireMate/
│
├── frontend/                           # Next.js 15.5.4 app
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── candidate-profile/
│   │   │   └── page.tsx
│   │   ├── resume-analysis/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   │
│   ├── components/                     # Shared UI & Layout
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/                         # Buttons, Inputs, etc (Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── form.tsx
│   │   │   └── input.tsx
│   │   └── common/                     # Common components
│   │       └── theme-provider.tsx
│   │
│   ├── hooks/                          # Custom reusable hooks
│   │   ├── useAuth.ts
│   │   ├── useToast.ts
│   │   └── useMobile.ts
│   │
│   ├── contexts/                       # React Contexts
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                            # Utils, API clients
│   │   ├── api.ts                      # API helper (fetch/axios)
│   │   ├── supabaseClient.ts
│   │   └── utils.ts
│   │
│   ├── public/                         # Static files
│   │   └── images/
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── middleware.ts
│   ├── next.config.mjs
│   ├── .env.local
│   └── tsconfig.json
│
├── backend/                            # FastAPI app
│   ├── app/
│   │   ├── main.py                     # Entry point
│   │   ├── core/                       # Configs & setup
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── routers/                    # API routes
│   │   │   ├── auth.py
│   │   │   ├── candidate.py
│   │   │   └── profile.py
│   │   ├── models/                     # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   └── candidate.py
│   │   ├── schemas/                    # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   └── candidate.py
│   │   ├── services/                   # Business logic
│   │   │   ├── auth_service.py
│   │   │   └── candidate_service.py
│   │   ├── utils/                      # Helper functions
│   │   │   └── helpers.py
│   │   └── middlewares/                # Middlewares (e.g. CORS)
│   │       └── cors.py
│   │
│   ├── scripts/                        # Maintenance / setup scripts
│   │   └── setup_db.py
│   │
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
├── docs/                               # Optional: API docs, setup guides
└── README.md




venv\Scripts\activate

uvicorn app.main:app --host localhost --port 3001 --reload 

## git cmd

cd C:\source\HireMate
git status        # check changes
git add .         # stage changes
git commit -m "your message"   # commit changes
git push          # push to GitHub
=======
# Final_year_project
>>>>>>> 5a3b6f55f95c521f5a966fcd89ae8abec8769286
