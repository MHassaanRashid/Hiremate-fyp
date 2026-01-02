from app.services.quiz_service import generate_ai_mcqs

print("Testing AI Quiz Generation with updated models...")
print("=" * 50)

questions = generate_ai_mcqs('Python Programming', 'intermediate', 3)

print(f"\n>> Generated {len(questions)} questions")
print(f"\nFirst Question Preview:")
print(f"Q: {questions[0]['question'][:100]}")
print(f"Options: {len(questions[0]['options'])} choices")
print(f"Correct: Option {questions[0]['correct_index']}")
