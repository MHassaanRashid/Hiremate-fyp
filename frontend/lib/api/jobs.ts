import { JobEndpoints } from "./endpoints";

export interface Job {
    id: string
    company_name: string
    company_logo?: string
    job_title: string
    location?: string
    salary_range?: string
    job_type?: string
    experience_level?: string
    skills_required?: string[]
    description?: string
    posted_date?: string
    is_active: boolean
}

interface GetJobsParams {
    page?: number
    pageSize?: number
    search?: string
    location?: string
    jobType?: string
}

interface JobsResponse {
    items: Job[]
    meta: {
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

export async function getJobs(token: string, params: GetJobsParams = {}): Promise<Job[]> {
    const query = new URLSearchParams()
    if (params.search) query.append("search", params.search)
    if (params.location) query.append("location", params.location)
    if (params.jobType) query.append("job_type", params.jobType)
    if (params.page) query.append("skip", ((params.page - 1) * (params.pageSize || 10)).toString())
    if (params.pageSize) query.append("limit", params.pageSize.toString())

    const response = await fetch(`${JobEndpoints.LIST}?${query.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Failed to fetch jobs")
    }

    return response.json()
}

export async function getJobDetail(token: string, id: string): Promise<Job> {
    const response = await fetch(JobEndpoints.DETAIL(id), {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Failed to fetch job details")
    }

    return response.json()
}

export async function getJobById(token: string, id: string): Promise<Job | null> {
    try {
        const response = await fetch(JobEndpoints.DETAIL(id), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (!response.ok) return null
        return await response.json()
    } catch (error) {
        return null
    }
}

export async function applyToJob(token: string, jobId: string, notes?: string): Promise<boolean> {
    const response = await fetch(`${JobEndpoints.DETAIL(jobId)}/apply`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to apply")
    }

    return true
}
