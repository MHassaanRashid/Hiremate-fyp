create table auth.users (
  instance_id uuid null,
  id uuid not null,
  aud character varying(255) null,
  role character varying(255) null,
  email character varying(255) null,
  encrypted_password character varying(255) null,
  email_confirmed_at timestamp with time zone null,
  invited_at timestamp with time zone null,
  confirmation_token character varying(255) null,
  confirmation_sent_at timestamp with time zone null,
  recovery_token character varying(255) null,
  recovery_sent_at timestamp with time zone null,
  email_change_token_new character varying(255) null,
  email_change character varying(255) null,
  email_change_sent_at timestamp with time zone null,
  last_sign_in_at timestamp with time zone null,
  raw_app_meta_data jsonb null,
  raw_user_meta_data jsonb null,
  is_super_admin boolean null,
  created_at timestamp with time zone null,
  updated_at timestamp with time zone null,
  phone text null default null::character varying,
  phone_confirmed_at timestamp with time zone null,
  phone_change text null default ''::character varying,
  phone_change_token character varying(255) null default ''::character varying,
  phone_change_sent_at timestamp with time zone null,
  confirmed_at timestamp with time zone GENERATED ALWAYS as (LEAST(email_confirmed_at, phone_confirmed_at)) STORED null,
  email_change_token_current character varying(255) null default ''::character varying,
  email_change_confirm_status smallint null default 0,
  banned_until timestamp with time zone null,
  reauthentication_token character varying(255) null default ''::character varying,
  reauthentication_sent_at timestamp with time zone null,
  is_sso_user boolean not null default false,
  deleted_at timestamp with time zone null,
  is_anonymous boolean not null default false,
  constraint users_pkey primary key (id),
  constraint users_phone_key unique (phone),
  constraint users_email_change_confirm_status_check check (
    (
      (email_change_confirm_status >= 0)
      and (email_change_confirm_status <= 2)
    )
  )
) TABLESPACE pg_default;

create index IF not exists users_instance_id_idx on auth.users using btree (instance_id) TABLESPACE pg_default;

create index IF not exists users_instance_id_email_idx on auth.users using btree (instance_id, lower((email)::text)) TABLESPACE pg_default;

create unique INDEX IF not exists confirmation_token_idx on auth.users using btree (confirmation_token) TABLESPACE pg_default
where
  ((confirmation_token)::text !~ '^[0-9 ]*$'::text);

create unique INDEX IF not exists recovery_token_idx on auth.users using btree (recovery_token) TABLESPACE pg_default
where
  ((recovery_token)::text !~ '^[0-9 ]*$'::text);

create unique INDEX IF not exists email_change_token_current_idx on auth.users using btree (email_change_token_current) TABLESPACE pg_default
where
  (
    (email_change_token_current)::text !~ '^[0-9 ]*$'::text
  );

create unique INDEX IF not exists email_change_token_new_idx on auth.users using btree (email_change_token_new) TABLESPACE pg_default
where
  (
    (email_change_token_new)::text !~ '^[0-9 ]*$'::text
  );

create unique INDEX IF not exists reauthentication_token_idx on auth.users using btree (reauthentication_token) TABLESPACE pg_default
where
  (
    (reauthentication_token)::text !~ '^[0-9 ]*$'::text
  );

create unique INDEX IF not exists users_email_partial_key on auth.users using btree (email) TABLESPACE pg_default
where
  (is_sso_user = false);

create index IF not exists users_is_anonymous_idx on auth.users using btree (is_anonymous) TABLESPACE pg_default;

create trigger on_auth_user_created
after INSERT on auth.users for EACH row
execute FUNCTION handle_new_user ();




create table public.activities (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  activity_type character varying(100) not null,
  title character varying(255) not null,
  description text null,
  related_entity_type character varying(50) null,
  related_entity_id uuid null,
  icon character varying(50) null,
  is_read boolean null default false,
  priority character varying(20) null default 'normal'::character varying,
  activity_date timestamp with time zone null default CURRENT_TIMESTAMP,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null default gen_random_uuid (),
  constraint activities_pkey primary key (id),
  constraint activities_user_id_key unique (user_id),
  constraint activities_user_id_fkey foreign KEY (user_id) references profiles (id)
) TABLESPACE pg_default;

create index IF not exists idx_activities_candidate_id on public.activities using btree (candidate_id) TABLESPACE pg_default;

create index IF not exists idx_activities_activity_date on public.activities using btree (activity_date desc) TABLESPACE pg_default;

create index IF not exists idx_activities_is_read on public.activities using btree (is_read) TABLESPACE pg_default;

create index IF not exists idx_activities_activity_type on public.activities using btree (activity_type) TABLESPACE pg_default;




create table public.applications (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  job_id uuid not null,
  company_name character varying(255) not null,
  job_title character varying(255) not null,
  location character varying(255) null,
  salary_range character varying(100) null,
  job_type character varying(50) null,
  status character varying(50) not null default 'pending'::character varying,
  applied_date timestamp with time zone null default CURRENT_TIMESTAMP,
  last_updated timestamp with time zone null default CURRENT_TIMESTAMP,
  cover_letter text null,
  resume_url character varying(500) null,
  notes text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null default gen_random_uuid (),
  constraint applications_pkey primary key (id),
  constraint applications_user_id_key unique (user_id),
  constraint applications_user_id_fkey foreign KEY (user_id) references profiles (id)
) TABLESPACE pg_default;

create index IF not exists idx_applications_candidate_id on public.applications using btree (candidate_id) TABLESPACE pg_default;

create index IF not exists idx_applications_job_id on public.applications using btree (job_id) TABLESPACE pg_default;

create index IF not exists idx_applications_status on public.applications using btree (status) TABLESPACE pg_default;

create index IF not exists idx_applications_applied_date on public.applications using btree (applied_date) TABLESPACE pg_default;

create trigger update_applications_updated_at BEFORE
update on applications for EACH row
execute FUNCTION update_updated_at_column ();






create table public.candidate_profile_strength (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  overall_score integer null default 0,
  basic_info_score integer null default 0,
  resume_score integer null default 0,
  skills_score integer null default 0,
  experience_score integer null default 0,
  education_score integer null default 0,
  certifications_score integer null default 0,
  has_profile_picture boolean null default false,
  has_resume boolean null default false,
  has_bio boolean null default false,
  has_skills boolean null default false,
  has_experience boolean null default false,
  has_education boolean null default false,
  has_certifications boolean null default false,
  has_portfolio boolean null default false,
  suggestions text[] null,
  last_calculated timestamp with time zone null default CURRENT_TIMESTAMP,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null default gen_random_uuid (),
  constraint candidate_profile_strength_pkey primary key (id),
  constraint candidate_profile_strength_candidate_id_key unique (candidate_id),
  constraint candidate_profile_strength_user_id_key unique (user_id),
  constraint candidate_profile_strength_user_id_fkey foreign KEY (user_id) references profiles (id),
  constraint candidate_profile_strength_overall_score_check check (
    (
      (overall_score >= 0)
      and (overall_score <= 100)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_profile_strength_candidate_id on public.candidate_profile_strength using btree (candidate_id) TABLESPACE pg_default;

create index IF not exists idx_profile_strength_overall_score on public.candidate_profile_strength using btree (overall_score desc) TABLESPACE pg_default;

create trigger update_profile_strength_updated_at BEFORE
update on candidate_profile_strength for EACH row
execute FUNCTION update_updated_at_column ();



create table public.candidate_settings (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  privacy_json jsonb not null default '{}'::jsonb,
  notifications_json jsonb not null default '{}'::jsonb,
  application_preferences_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint candidate_settings_pkey primary key (id),
  constraint candidate_settings_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists idx_candidate_settings_user on public.candidate_settings using btree (user_id) TABLESPACE pg_default;



create table public.interview_feedback (
  id uuid not null default gen_random_uuid (),
  interview_id integer null,
  skill text not null,
  score integer null,
  comment text null,
  created_at timestamp without time zone null default now(),
  constraint interview_feedback_pkey primary key (id)
) TABLESPACE pg_default;


create table public.interviews (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  application_id uuid null,
  company_name character varying(255) not null,
  job_title character varying(255) not null,
  interview_type character varying(100) not null,
  scheduled_date date not null,
  scheduled_time time without time zone not null,
  duration_minutes integer null default 60,
  location character varying(255) null,
  interviewer_name character varying(255) null,
  interviewer_email character varying(255) null,
  status character varying(50) null default 'scheduled'::character varying,
  notes text null,
  preparation_notes text null,
  feedback text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null default gen_random_uuid (),
  constraint interviews_pkey primary key (id),
  constraint interviews_user_id_key unique (user_id),
  constraint interviews_application_id_fkey foreign KEY (application_id) references applications (id) on delete set null,
  constraint interviews_user_id_fkey foreign KEY (user_id) references profiles (id)
) TABLESPACE pg_default;

create index IF not exists idx_interviews_candidate_id on public.interviews using btree (candidate_id) TABLESPACE pg_default;

create index IF not exists idx_interviews_application_id on public.interviews using btree (application_id) TABLESPACE pg_default;

create index IF not exists idx_interviews_scheduled_date on public.interviews using btree (scheduled_date) TABLESPACE pg_default;

create index IF not exists idx_interviews_status on public.interviews using btree (status) TABLESPACE pg_default;

create trigger update_interviews_updated_at BEFORE
update on interviews for EACH row
execute FUNCTION update_updated_at_column ();

create table public.profile_views (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  viewer_type character varying(50) not null,
  viewer_id uuid null,
  viewer_name character varying(255) null,
  viewer_company character varying(255) null,
  viewed_date date not null default CURRENT_DATE,
  view_count integer null default 1,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null default gen_random_uuid (),
  constraint profile_views_pkey primary key (id),
  constraint profile_views_candidate_id_viewer_id_viewed_date_key unique (candidate_id, viewer_id, viewed_date),
  constraint profile_views_user_id_key unique (user_id),
  constraint profile_views_user_id_fkey foreign KEY (user_id) references profiles (id)
) TABLESPACE pg_default;

create index IF not exists idx_profile_views_candidate_id on public.profile_views using btree (candidate_id) TABLESPACE pg_default;

create index IF not exists idx_profile_views_viewed_date on public.profile_views using btree (viewed_date) TABLESPACE pg_default;

create index IF not exists idx_profile_views_viewer_type on public.profile_views using btree (viewer_type) TABLESPACE pg_default;

create trigger update_profile_views_updated_at BEFORE
update on profile_views for EACH row
execute FUNCTION update_updated_at_column ();



create table public.profiles (
  id uuid not null,
  role text not null,
  full_name text null,
  email text not null,
  phone text null,
  location text null,
  summary text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  ai_score integer null default 0,
  resume_completed boolean null default false,
  experience text null,
  education text null,
  skills jsonb null,
  avatar_url text null,
  portfolio text null,
  linkedin text null,
  github text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (
        array[
          'candidate'::text,
          'recruiter'::text,
          'interviewer'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;



create table public.recommended_jobs (
  id uuid not null default extensions.uuid_generate_v4 (),
  candidate_id uuid not null,
  job_id uuid not null,
  company_name character varying(255) not null,
  company_logo character varying(500) null,
  job_title character varying(255) not null,
  location character varying(255) null,
  salary_range character varying(100) null,
  job_type character varying(50) null,
  experience_level character varying(50) null,
  skills_required text[] null,
  description text null,
  match_score integer null default 0,
  match_reasons text[] null,
  posted_date date null,
  is_saved boolean null default false,
  is_applied boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  user_id uuid not null default gen_random_uuid (),
  constraint recommended_jobs_pkey primary key (id),
  constraint recommended_jobs_candidate_id_job_id_key unique (candidate_id, job_id),
  constraint recommended_jobs_user_id_key unique (user_id),
  constraint recommended_jobs_user_id_fkey foreign KEY (user_id) references profiles (id),
  constraint recommended_jobs_match_score_check check (
    (
      (match_score >= 0)
      and (match_score <= 100)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_recommended_jobs_candidate_id on public.recommended_jobs using btree (candidate_id) TABLESPACE pg_default;

create index IF not exists idx_recommended_jobs_job_id on public.recommended_jobs using btree (job_id) TABLESPACE pg_default;

create index IF not exists idx_recommended_jobs_match_score on public.recommended_jobs using btree (match_score desc) TABLESPACE pg_default;

create index IF not exists idx_recommended_jobs_is_saved on public.recommended_jobs using btree (is_saved) TABLESPACE pg_default;

create trigger update_recommended_jobs_updated_at BEFORE
update on recommended_jobs for EACH row
execute FUNCTION update_updated_at_column ();


create table public.resume (
  id uuid not null default gen_random_uuid (),
  personal_info_json jsonb null default '{}'::jsonb,
  education_json jsonb null default '[]'::jsonb,
  experience_json jsonb null default '[]'::jsonb,
  projects_json jsonb null default '[]'::jsonb,
  skills_json jsonb null default '[]'::jsonb,
  certificates_json jsonb null default '[]'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint resume_pkey primary key (id)
) TABLESPACE pg_default;




create table public.sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  session_data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  expires_at timestamp with time zone not null,
  is_active boolean null default true,
  last_accessed_at timestamp with time zone null default now(),
  constraint sessions_pkey primary key (id),
  constraint sessions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_sessions_user_id on public.sessions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_sessions_expires_at on public.sessions using btree (expires_at) TABLESPACE pg_default;

create index IF not exists idx_sessions_is_active on public.sessions using btree (is_active) TABLESPACE pg_default;



create table public.skills (
  id serial not null,
  user_id uuid null,
  skill character varying not null,
  score integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint skills_pkey primary key (id)
) TABLESPACE pg_default;