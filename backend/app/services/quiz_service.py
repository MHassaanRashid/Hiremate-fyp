import json
import os
from google import genai
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

# Initialize Gemini client
# Note: GEMINI_API_KEY should be in your .env file
client = None
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)


# List of models to try in order of preference
PREFERRED_MODELS = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash-exp",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
]

def generate_with_fallback(client, prompt: str):
    """
    Attempts to generate content using a list of preferred models.
    Falls back to the next model if the current one fails.
    """
    # Allow overriding via environment variable
    env_model = os.getenv("GEMINI_MODEL")
    models_to_try = [env_model] + PREFERRED_MODELS if env_model else PREFERRED_MODELS
    
    # Remove duplicates while preserving order
    seen = set()
    unique_models = [x for x in models_to_try if x and not (x in seen or seen.add(x))]

    last_error = None

    for model_name in unique_models:
        try:
            print(f"Attempting to generate with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            print(f"Success with model: {model_name}")
            return response
        except Exception as e:
            print(f"Failed with model {model_name}: {e}")
            last_error = e
            continue
    
    # If we get here, all models failed
    raise last_error or Exception("No valid Gemini models found.")

def generate_ai_mcqs(topic: str, difficulty: str = "intermediate", num_questions: int = 10) -> List[Dict]:
    """
    Generates multiple-choice questions using Google Gemini AI.
    """
    if not client:
        print("Warning: GEMINI_API_KEY not found. Falling back to mock questions.")
        return generate_mock_questions(topic, num_questions)

    prompt = f"""Generate {num_questions} multiple-choice questions on the topic: "{topic}"
Difficulty Level: {difficulty}

Return ONLY a JSON object with this exact structure:
{{
  "questions": [
    {{
      "question": "The question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Brief explanation of why this is correct"
    }}
  ]
}}

Ensure there are exactly {num_questions} questions. Keep options clear and distinct.
Important: Return ONLY the raw JSON. No markdown, no code blocks, no preamble."""

    try:
        response = generate_with_fallback(client, prompt)
        
        text = response.text.strip()
        
        # Clean up potential markdown formatting
        if text.startswith("```"):
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                text = text[start:end+1]
        
        data = json.loads(text)
        questions = data.get("questions", [])
        
        if not questions:
            print("Warning: Gemini returned no questions. Falling back to mock.")
            return generate_mock_questions(topic, num_questions)
            
        return questions
        
    except Exception as e:
        print(f"CRITICAL ERROR generating AI questions: {e}")
        # Print full traceback for debugging if needed
        import traceback
        traceback.print_exc()
        return generate_mock_questions(topic, num_questions)

def generate_mock_questions(topic: str, n: int) -> List[Dict]:
    """Fallback mock questions if AI fails or API key is missing"""
    questions = []
    for i in range(n):
        questions.append({
            "question": f"Sample {topic} knowledge question {i+1}?",
            "options": [f"Correct answer for {i+1}", "Incorrect option 1", "Incorrect option 2", "Incorrect option 3"],
            "correct_index": 0,
            "explanation": "This is a fallback mock question."
        })
    return questions
