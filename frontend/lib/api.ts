const API_URL = "/api";

// Helper to handle fetch responses
export const handleResponse = async (res: Response) => {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) {
      // Check for 401 Unauthorized (session expired)
      if (res.status === 401) {
        // Clear session and redirect to login
        if (typeof window !== 'undefined') {
          const clearAuthSession = (window as any).clearAuthSession;
          if (clearAuthSession) {
            clearAuthSession();
          } else {
            // Fallback if global function not available
            // Determine role-specific redirect before clearing localStorage
            let roleBasedRedirect = '/auth/candidate'; // Default fallback

            try {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const userData = JSON.parse(storedUser);
                const userRole = userData.role;

                // Map role to appropriate auth page
                if (userRole === "recruiter") {
                  roleBasedRedirect = "/auth/company";
                } else if (userRole === "interviewer") {
                  roleBasedRedirect = "/auth/interviewer";
                } else {
                  roleBasedRedirect = "/auth/candidate";
                }
              }
            } catch (error) {
              console.log("Could not determine user role, using default redirect");
            }

            // Clear session data
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
            document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
            document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Strict";
            document.cookie = "user_role=; path=/; max-age=0; SameSite=Strict";

            if (!window.location.pathname.startsWith('/auth')) {
              window.location.href = roleBasedRedirect;
            }
          }
        }
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`Error: ${data.detail || JSON.stringify(data)}`);
    }
    return data;
  } catch (error: any) {
    // Re-throw if it's already an Error with message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected response: ${text}`);
  }
};


/* ===========================================================
   RESUME API FUNCTIONS
   =========================================================== */

// ✅ Get user resume
// export const getUserResume = async (token: string) => {
//   try {
//     const res = await fetch(`${API_URL}/resume`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error fetching resume data:", error);
//     throw new Error(`Failed to fetch resume data: ${error}`);
//   }
// };

// // ✅ Save (create or update) user resume
// export const saveResume = async (token: string, resumeData: any) => {
//   try {
//     const res = await fetch(`${API_URL}/resume/save`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ resumeData }),
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error saving resume:", error);
//     throw new Error(`Failed to save resume: ${error}`);
//   }
// };

// // ✅ Save individual resume section progressively
// // ✅ Save individual resume section progressively (fixed)
// export const saveResumeSection = async (token: string, section: string, data: any) => {
//   try {
//     // Ensure data is an object (FastAPI requires a dict, not an array)
//     const formattedData = Array.isArray(data) ? { items: data } : data || {};

//     console.log("Saving section payload:", {
//       section,
//       data: formattedData,
//     });

//     const res = await fetch(`${API_URL}/resume/save-section`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         section,
//         data: formattedData,
//       }),
//     });

//     return await handleResponse(res);
//   } catch (error) {
//     console.error(`Error saving ${section} section:`, error);
//     throw new Error(`Failed to save ${section}: ${error}`);
//   }
// };


// // ✅ Get specific resume section
// export const getResumeSection = async (token: string, section: string) => {
//   try {
//     const res = await fetch(`${API_URL}/resume/sections/${section}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error(`Error fetching ${section} section:`, error);
//     throw new Error(`Failed to fetch ${section}: ${error}`);
//   }
// };

// // ✅ Delete user resume
// export const deleteResume = async (token: string) => {
//   try {
//     const res = await fetch(`${API_URL}/resume`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error deleting resume:", error);
//     throw new Error(`Failed to delete resume: ${error}`);
//   }
// };

// // ✅ Get available resume templates
// export const getResumeTemplates = async () => {
//   try {
//     const res = await fetch(`${API_URL}/resume/templates`, {
//       method: "GET",
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error fetching resume templates:", error);
//     throw new Error(`Failed to fetch templates: ${error}`);
//   }
// };

// // ✅ Analyze resume (AI insights)
// export const analyzeResume = async (token: string) => {
//   try {
//     const res = await fetch(`${API_URL}/resume/analyze`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error analyzing resume:", error);
//     throw new Error(`Failed to analyze resume: ${error}`);
//   }
// };
