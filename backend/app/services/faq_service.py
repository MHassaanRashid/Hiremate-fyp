import os
from google import genai
from app.core.extension import supabase_client
from app.services.quiz_service import generate_with_fallback

def get_faq_answer(user_query: str):
    """
    Retrieves relevant FAQs from Supabase and uses Gemini to generate a response.
    Includes a robust 'Base Knowledge' fallback for generic project questions.
    """
    try:
        # 1. Quick check for greetings/small talk
        query_lower = user_query.lower().strip()
        greetings = ["hi", "hello", "hey", "how are you", "who are you", "greetings"]
        if any(greet == query_lower or query_lower.startswith(greet) for greet in greetings):
            return "Hello! I'm the HireMate AI Assistant. How can I help you today with your recruitment or job search questions?"

        # 2. Retrieve relevant FAQs from Supabase using Text Search
        context = ""
        try:
            print(f"DEBUG: Searching FAQ for: {user_query}")
            response = supabase_client.table("faqs").select("question, answer").text_search("fts", user_query).execute()
            if response.data:
                for item in response.data:
                    context += f"Q: {item['question']}\nA: {item['answer']}\n\n"
        except Exception as search_err:
            print(f"WARNING: FAQ Search failed (continuing with base knowledge): {search_err}")

        # 3. Define Base Knowledge about the project (Fallback)
        base_knowledge = """
        About HireMate:
        - HireMate is an AI-powered recruitment platform designed for Candidates, Interviewers, and Companies.
        - For Candidates: We offer a Progressive Resume Builder, AI-driven Job Recommendations, and Proctored AI Quizzes for skill verification.
        - For Interviewers: We provide Automated Interview Scheduling, live proctoring monitoring tools, and an AI Feedback system.
        - For Companies: We enable Job Posting, Applicant Tracking, and AI-powered Resume Analysis to find the best talent.
        - Tech Stack: Built with React/Next.js, FastAPI/Python, and Supabase.
        """

        # 4. Augment prompt with context and base knowledge (Strict Relevance)
        system_instruction = f"""
        You are the HireMate FAQ Assistant. Provide a direct, professional, and TO-THE-POINT answer.
        
        BASE KNOWLEDGE:
        {base_knowledge}
        
        SPECIFIC FAQ DATA:
        {context if context else "No direct matches."}
        
        STRICT RELEVANCE RULES:
        - ONLY answer the specific question asked. 
        - DO NOT mention the tech stack (React, FastAPI, Supabase) unless specifically asked about the technology.
        - DO NOT provide information about other roles (Interviewers, Companies) if the question is only about a Candidate feature.
        - DO NOT use bullet points or a greeting.
        - Keep the entire response to 1 or 2 clear sentences max.
        - If the answer isn't in the knowledge base, simply say: "I don't have information on that specific topic. Please contact support."
        """
        
        prompt = f"{system_instruction}\n\nUser Question: {user_query}\nAnswer:"
        
        # 5. Generate answer using existing fallback mechanism
        print(f"DEBUG: Calling Gemini for FAQ answer...")
        response = generate_with_fallback(prompt)
        answer = response.text if response.text else "I'm sorry, I couldn't generate a response. Please try asking in a different way."
        print(f"DEBUG: Gemini response received.")
        return answer
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in get_faq_answer: {e}")
        traceback.print_exc()
        return "I'm sorry, I encountered an error while processing your request. Please try again later."
