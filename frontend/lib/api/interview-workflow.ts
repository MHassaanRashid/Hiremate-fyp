const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function getAvailableSlots(token: string, techStack: string) {
    const response = await fetch(`${API_URL}/interview-workflow/available-slots?tech_stack=${encodeURIComponent(techStack)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch available slots')
    }

    return response.json()
}

export async function bookSlot(token: string, bookingData: {
    interviewer_id: string,
    scheduled_at: string,
    job_title: string,
    company_name: string
}) {
    const response = await fetch(`${API_URL}/interview-workflow/book-slot`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })

    if (!response.ok) {
        throw new Error('Failed to book slot')
    }

    return response.json()
}
