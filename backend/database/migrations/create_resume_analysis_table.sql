-- Resume Analysis Table Migration
-- This table stores AI-powered resume analysis results

create table if not exists public.resume_analysis (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  resume_id uuid null,
  job_id uuid null,
  
  -- Scores (0-100)
  overall_score integer not null,
  completeness_score integer null,
  ats_score integer null,
  keyword_score integer null,
  formatting_score integer null,
  content_quality_score integer null,
  
  -- Analysis Results
  suggestions jsonb default '[]'::jsonb,
  missing_keywords text[] null,
  strengths text[] null,
  weaknesses text[] null,
  analyzed_sections jsonb default '{}'::jsonb,
  
  -- AI Response (optional, for debugging/history)
  ai_response_text text null,
  
  -- Timestamps
  analyzed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  
  -- Constraints
  constraint resume_analysis_pkey primary key (id),
  constraint resume_analysis_user_id_fkey foreign key (user_id) 
    references auth.users (id) on delete cascade,
  constraint resume_analysis_overall_score_check check (
    (overall_score >= 0) and (overall_score <= 100)
  ),
  constraint resume_analysis_completeness_score_check check (
    (completeness_score is null) or ((completeness_score >= 0) and (completeness_score <= 100))
  ),
  constraint resume_analysis_ats_score_check check (
    (ats_score is null) or ((ats_score >= 0) and (ats_score <= 100))
  ),
  constraint resume_analysis_keyword_score_check check (
    (keyword_score is null) or ((keyword_score >= 0) and (keyword_score <= 100))
  ),
  constraint resume_analysis_formatting_score_check check (
    (formatting_score is null) or ((formatting_score >= 0) and (formatting_score <= 100))
  ),
  constraint resume_analysis_content_quality_score_check check (
    (content_quality_score is null) or ((content_quality_score >= 0) and (content_quality_score <= 100))
  )
);

-- Indexes for performance
create index if not exists idx_resume_analysis_user_id 
  on public.resume_analysis using btree (user_id);

create index if not exists idx_resume_analysis_analyzed_at 
  on public.resume_analysis using btree (analyzed_at desc);

create index if not exists idx_resume_analysis_overall_score 
  on public.resume_analysis using btree (overall_score desc);

-- Comments for documentation
comment on table public.resume_analysis is 'Stores AI-powered resume analysis results with scores and suggestions';
comment on column public.resume_analysis.overall_score is 'Overall resume quality score (0-100)';
comment on column public.resume_analysis.ats_score is 'ATS (Applicant Tracking System) compatibility score (0-100)';
comment on column public.resume_analysis.suggestions is 'JSON array of improvement suggestions with priority levels';
comment on column public.resume_analysis.analyzed_sections is 'JSON object containing detailed section-wise analysis';
