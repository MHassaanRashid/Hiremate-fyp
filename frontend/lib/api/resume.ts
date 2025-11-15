// frontend/lib/api/resume.ts
import { ResumeEndpoints } from "./endpoints";
import { handleResponse } from "../api";
import { ResumeData } from "../resume/types";

// Full resume
export const getUserResume = async (token: string) => {
  const res = await fetch(ResumeEndpoints.GET_FULL_RESUME, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const saveResume = async (token: string, resumeData: ResumeData) => {
  const res = await fetch(ResumeEndpoints.SAVE_FULL_RESUME, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ resumeData }),
  });
  return handleResponse(res);
};

// Save individual section
export const saveResumeSection = async (token: string, section: string, data: any) => {
  const formattedData = Array.isArray(data) ? { items: data } : data || {};
  const res = await fetch(ResumeEndpoints.SAVE_SECTION, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ section, data: formattedData }),
  });
  return handleResponse(res);
};

// Get a specific section
export const getResumeSection = async (token: string, section: string) => {
  const res = await fetch(ResumeEndpoints.GET_SECTION(section), {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// Delete resume
export const deleteResume = async (token: string) => {
  const res = await fetch(ResumeEndpoints.DELETE_RESUME, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// Templates
export const getResumeTemplates = async () => {
  const res = await fetch(ResumeEndpoints.GET_TEMPLATES, { method: "GET" });
  return handleResponse(res);
};

// Analyze resume
export const analyzeResume = async (token: string) => {
  const res = await fetch(ResumeEndpoints.ANALYZE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};
