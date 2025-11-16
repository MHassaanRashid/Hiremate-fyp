import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// Example API route for candidate dashboard
// Replace with your actual database queries

export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user from session
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // const { data: { user } } = await supabase.auth.getUser();
    
    // For now, using mock candidate ID
    const candidateId = 'mock-candidate-id';

    // TODO: Replace these with actual database queries
    // Example using Supabase:
    
    // Get profile data
    // const { data: profile } = await supabase
    //   .from('candidates')
    //   .select('name, profile_completion, avatar_url')
    //   .eq('id', candidateId)
    //   .single();

    // Get stats
    // const { data: stats } = await supabase
    //   .from('candidate_dashboard_stats')
    //   .select('*')
    //   .eq('candidate_id', candidateId)
    //   .single();

    // Get applications
    // const { data: applications } = await supabase
    //   .from('applications')
    //   .select('id, job_title, company_name, applied_date, status')
    //   .eq('candidate_id', candidateId)
    //   .order('applied_date', { ascending: false })
    //   .limit(10);

    // Get recommended jobs
    // const { data: recommendedJobs } = await supabase
    //   .from('recommended_jobs')
    //   .select('id, job_title, company, match_percentage, location, job_type')
    //   .eq('candidate_id', candidateId)
    //   .order('match_percentage', { ascending: false })
    //   .limit(10);

    // Get interviews
    // const { data: interviews } = await supabase
    //   .from('interviews')
    //   .select('id, position, company, interview_date, interview_time, type, meeting_link')
    //   .eq('candidate_id', candidateId)
    //   .gte('interview_date', new Date().toISOString().split('T')[0])
    //   .order('interview_date', { ascending: true });

    // Get profile strength
    // const { data: profileStrength } = await supabase
    //   .from('candidate_profile_strength')
    //   .select('has_resume, has_skills, has_photo, has_experience, has_education, has_certifications')
    //   .eq('candidate_id', candidateId)
    //   .single();

    // Get activity
    // const { data: activity } = await supabase
    //   .from('activities')
    //   .select('id, type, message, created_at')
    //   .eq('candidate_id', candidateId)
    //   .order('created_at', { ascending: false })
    //   .limit(10);

    // Mock response for development
    const dashboardData = {
      profile: {
        name: 'Sarah Johnson',
        profileCompletion: 75,
        avatar: undefined,
      },
      stats: {
        applicationsSubmitted: 12,
        interviewsScheduled: 3,
        profileViews: 48,
        profileScore: 85,
      },
      applications: [
        {
          id: '1',
          jobTitle: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          date: '2024-01-15',
          status: 'reviewing',
        },
        {
          id: '2',
          jobTitle: 'React Developer',
          company: 'StartupHub',
          date: '2024-01-14',
          status: 'shortlisted',
        },
      ],
      recommendedJobs: [
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'Innovation Labs',
          matchPercentage: 95,
          location: 'San Francisco, CA',
          type: 'Full-time',
        },
      ],
      interviews: [
        {
          id: '1',
          position: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          date: '2024-01-20',
          time: '10:00 AM',
          type: 'online',
          meetingLink: 'https://meet.example.com/abc123',
        },
      ],
      profileStrength: {
        resume: true,
        skills: true,
        photo: false,
        experience: true,
        education: true,
        certifications: false,
      },
      activity: [
        {
          id: '1',
          type: 'view',
          message: 'Your profile was viewed by TechCorp Inc.',
          timestamp: '2 hours ago',
        },
      ],
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Helper function to format timestamps
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}
