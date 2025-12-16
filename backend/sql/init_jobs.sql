-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  job_title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  job_type VARCHAR(50), -- Full-time, Part-time, Contract, Remote
  experience_level VARCHAR(50), -- Entry, Mid, Senior
  skills_required TEXT[],
  description TEXT,
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON public.jobs(company_name);
CREATE INDEX IF NOT EXISTS idx_jobs_job_title ON public.jobs(job_title);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);

-- Insert Dummy Data
INSERT INTO public.jobs (company_name, job_title, location, salary_range, job_type, experience_level, skills_required, description)
VALUES 
('TechCorp', 'Frontend Developer', 'Remote', '$80k - $120k', 'Full-time', 'Mid', ARRAY['React', 'TypeScript', 'Tailwind'], 'We are looking for a skilled Frontend Developer to join our team...'),
('DataSystems', 'Backend Engineer', 'New York, NY', '$100k - $140k', 'Full-time', 'Senior', ARRAY['Python', 'FastAPI', 'PostgreSQL'], 'Join our backend team to build scalable microservices...'),
('DesignStudio', 'UI/UX Designer', 'San Francisco, CA', '$90k - $130k', 'Contract', 'Mid', ARRAY['Figma', 'Adobe XD', 'Prototyping'], 'Creative designer needed for multiple client projects...'),
('CloudNet', 'DevOps Engineer', 'Remote', '$110k - $150k', 'Full-time', 'Senior', ARRAY['AWS', 'Docker', 'Kubernetes'], 'Manage our cloud infrastructure and CI/CD pipelines...'),
('StartUp Inc', 'Product Manager', 'Austin, TX', '$95k - $135k', 'Full-time', 'Mid', ARRAY['Agile', 'JIRA', 'Product Strategy'], 'Lead product development from conception to launch...');
