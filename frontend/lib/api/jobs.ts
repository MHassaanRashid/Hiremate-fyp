import { JobEndpoints } from "./endpoints";

export interface Job {
    id: string;
    company_name: string;
    job_title: string;
    location: string;
    job_type: string;
    salary_range?: string;
    description?: string;
    requirements?: string[];
    posted_date?: string;
    logo_url?: string;
}

export const getJobs = async (token: string, search?: string, location?: string, type?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (location && location !== "All Locations") params.append("location", location);
    if (type && type !== "All Types") params.append("job_type", type);

    const res = await fetch(`${JobEndpoints.LIST}?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
};

export const getJobDetails = async (token: string, id: string) => {
    const res = await fetch(JobEndpoints.DETAIL(id), {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch job details");
    return res.json();
}

export const applyToJob = async (token: string, jobId: string, note?: string) => {
    const res = await fetch(JobEndpoints.APPLY(jobId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to submit application");
    }
    return res.json();
};
