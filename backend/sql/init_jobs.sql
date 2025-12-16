-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    location TEXT NOT NULL,
    job_type TEXT NOT NULL, -- Full-time, Part-time, Contract, etc.
    salary_range TEXT,
    description TEXT,
    requirements TEXT[],
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logo_url TEXT
);

-- Insert dummy data if table is empty
INSERT INTO jobs (company_name, job_title, location, job_type, salary_range, description, requirements, logo_url)
SELECT 'TechCorp', 'Senior Frontend Engineer', 'Remote', 'Full-time', '$120k - $150k', 'We are looking for an experienced Frontend Engineer...', ARRAY['React', 'TypeScript', 'Next.js'], 'https://via.placeholder.com/50'
WHERE NOT EXISTS (SELECT 1 FROM jobs LIMIT 1);

INSERT INTO jobs (company_name, job_title, location, job_type, salary_range, description, requirements, logo_url)
SELECT 'DataSystems', 'Backend Developer', 'New York, NY', 'Full-time', '$130k - $160k', 'Join our backend team to build scalable systems...', ARRAY['Python', 'FastAPI', 'PostgreSQL'], 'https://via.placeholder.com/50'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE company_name = 'DataSystems');

INSERT INTO jobs (company_name, job_title, location, job_type, salary_range, description, requirements, logo_url)
SELECT 'DesignStudio', 'UI/UX Designer', 'San Francisco, CA', 'Contract', '$80/hr', 'Creative designer needed for a 6-month project...', ARRAY['Figma', 'Adobe XD', 'Prototyping'], 'https://via.placeholder.com/50'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE company_name = 'DesignStudio');

INSERT INTO jobs (company_name, job_title, location, job_type, salary_range, description, requirements, logo_url)
SELECT 'CloudSolutions', 'DevOps Engineer', 'Remote', 'Full-time', '$140k - $170k', 'Manage our cloud infrastructure...', ARRAY['AWS', 'Docker', 'Kubernetes'], 'https://via.placeholder.com/50'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE company_name = 'CloudSolutions');

INSERT INTO jobs (company_name, job_title, location, job_type, salary_range, description, requirements, logo_url)
SELECT 'InnovateInc', 'Product Manager', 'Austin, TX', 'Full-time', '$110k - $140k', 'Lead product development from ideation to launch...', ARRAY['Product Management', 'Agile', 'Jira'], 'https://via.placeholder.com/50'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE company_name = 'InnovateInc');
