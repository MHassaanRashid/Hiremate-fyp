# HireMate Project Structure & Architecture

## 🏗️ Project Organization

### Backend Structure (FastAPI)
```
backend/
├── app/
│   ├── main.py                      # FastAPI entry point
│   ├── core/                        # Configuration & database
│   │   ├── config.py
│   │   ├── database.py
│   │   └── extension.py             # Supabase client
│   ├── routers/                     # API routes
│   │   ├── __init__.py
│   │   ├── auth.py                  # Authentication
│   │   ├── resume.py                # ✅ NEW: Progressive resume saving
│   │   ├── candidate.py
│   │   └── profile.py
│   ├── models/                      # SQLAlchemy models
│   │   └── user.py
│   ├── schemas/                     # Pydantic schemas
│   │   └── resume.py                # Resume data validation
│   └── middlewares/                 # CORS & other middleware
│       └── cors.py
```

### Frontend Structure (Next.js 14)
```
frontend/
├── app/                             # App Router (Next.js 14)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── candidate/
│   │   └── resume/
│   │       └── page.tsx             # ✅ UPDATED: Progressive resume builder
│   └── auth/
├── components/
│   ├── resume/                      # Resume building components
│   │   ├── types.ts                 # TypeScript definitions
│   │   ├── PersonalInfo.tsx
│   │   ├── Experience.tsx
│   │   ├── Education.tsx
│   │   ├── Skills.tsx
│   │   ├── Projects.tsx
│   │   ├── Certificates.tsx
│   │   └── ResumePreview.tsx        # ✅ UPDATED: Enhanced preview
│   └── ui/                          # Shadcn/UI components
├── lib/
│   ├── api.ts                       # ✅ UPDATED: API client with progressive saving
│   └── utils.ts
└── contexts/
    └── auth-context.tsx
```

## 🚀 New Features Implemented

### 1. Progressive Resume Saving
- **Auto-save**: Each section saves automatically after 1 second of no changes
- **Section tracking**: Visual indicators show which sections are completed
- **Real-time status**: Progress bars and completion percentages
- **Data persistence**: No data loss when navigating between sections

### 2. Enhanced Backend API

#### New Endpoints:
- `POST /resume/save-section` - Save individual resume sections
- `GET /resume/sections/{section}` - Get specific section data
- `POST /resume/save` - Complete resume save (existing, improved)

#### Features:
- Section-by-section data validation
- Automatic profile creation if doesn't exist
- Progressive completion tracking
- Better error handling and responses

### 3. Improved Frontend Architecture

#### Resume Builder Features:
- **Step-by-step navigation** with validation
- **Auto-save indicators** with loading states
- **Section completion tracking** with visual feedback
- **Progressive step unlocking** based on completion
- **Enhanced preview** with completion statistics

#### UI/UX Improvements:
- Real-time auto-save notifications
- Visual completion indicators
- Better error handling and user feedback
- Mobile-responsive design
- Professional resume preview with download

### 4. Better State Management
- Debounced auto-save (1-second delay)
- Section completion state tracking
- Better error state handling
- Loading states for all operations

## 🔄 Data Flow

### Progressive Saving Flow:
1. **User enters data** in any section
2. **Debounced save** triggers after 1 second
3. **API call** to `/resume/save-section`
4. **Database update** for specific section
5. **UI feedback** confirms save
6. **Step completion** marked if section has sufficient data

### Final Save Flow:
1. **User reaches preview step**
2. **Completion check** (minimum 60% required)
3. **Final save** to `/resume/save` endpoint
4. **Success notification** with celebration
5. **Redirect** to `/candidate` dashboard

## 📊 Database Schema

### Profiles Table Structure:
```sql
profiles {
  id: uuid (primary key)
  personal_info: jsonb    -- Name, email, phone, etc.
  education: jsonb[]      -- Array of education entries
  experience: jsonb[]     -- Array of work experience
  skills: jsonb[]         -- Array of skills with levels
  projects: jsonb[]       -- Array of projects
  certificates: jsonb[]   -- Array of certifications
  languages: jsonb[]      -- Array of languages
  resume_uploaded: boolean
  ai_score: integer
  updated_at: timestamp
}
```

## 🎯 Key Benefits

### For Users:
- ✅ **No data loss** - Auto-save prevents losing work
- ✅ **Progress tracking** - Clear visual feedback on completion
- ✅ **Flexible workflow** - Complete sections in any order
- ✅ **Professional output** - High-quality resume preview
- ✅ **Mobile friendly** - Works on all devices

### For Developers:
- ✅ **Better API structure** - RESTful endpoints with proper validation
- ✅ **Type safety** - Full TypeScript integration
- ✅ **Error handling** - Comprehensive error management
- ✅ **Maintainable code** - Well-organized, documented structure
- ✅ **Scalable architecture** - Easy to add new features

## 🔧 Technical Stack

### Backend:
- **FastAPI** - Modern Python web framework
- **Supabase** - Database and authentication
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

### Frontend:
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern UI component library
- **React Hook Form** - Form state management
- **React Hot Toast** - Toast notifications

## 🚦 How to Use

### Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --host localhost --port 3001 --reload
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables:
- Backend: `.env` file with Supabase credentials
- Frontend: `.env.local` file with API URL

## 📈 Future Enhancements

### Planned Features:
- [ ] **Resume templates** - Multiple professional templates
- [ ] **AI suggestions** - Smart content recommendations
- [ ] **Export formats** - PDF, Word, JSON exports
- [ ] **Analytics** - Resume performance tracking
- [ ] **Collaboration** - Share and get feedback
- [ ] **ATS optimization** - Applicant Tracking System compatibility

### Technical Improvements:
- [ ] **Offline support** - Work without internet
- [ ] **Real-time collaboration** - Multiple editors
- [ ] **Version history** - Track changes over time
- [ ] **Performance optimization** - Faster loading times
- [ ] **Testing** - Comprehensive test coverage

This improved architecture provides a solid foundation for building a professional, user-friendly resume builder with excellent developer experience and maintainability.
