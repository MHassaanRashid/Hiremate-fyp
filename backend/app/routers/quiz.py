from fastapi import APIRouter, Depends, HTTPException, status
from app.core.extension import supabase_client
from app.routers.auth_dependency import get_current_user
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import uuid
import json
from app.services.quiz_service import generate_ai_mcqs

router = APIRouter(prefix="/quiz", tags=["Quiz"])

# =====================================================
# Request/Response Models
# =====================================================

class CreateQuizRequest(BaseModel):
    language: str

class SubmitAnswerRequest(BaseModel):
    question_id: str
    selected_option: int = None
    code_submission: str = None
    answer_text: str = None
    time_spent_seconds: int = 0

# =====================================================
# Routes
# =====================================================

@router.get("/languages")
async def get_test_languages():
    """Get available test languages"""
    try:
        res = supabase_client.table("test_languages").select("*").eq("is_active", True).execute()
        
        return {
            'languages': [
                {
                    'id': str(lang['id']),
                    'name': lang['language_name'],
                    'code': lang['language_code'],
                    'display_name': lang['display_name'],
                    'description': lang.get('description', ''),
                    'duration_minutes': lang['default_duration_minutes'],
                    'question_count': lang['default_question_count'],
                    'passing_score': float(lang['passing_score_percentage'])
                }
                for lang in (res.data or [])
            ]
        }
    except Exception as e:
        print(f"Error fetching languages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_quiz(
    request: CreateQuizRequest,
    current_user = Depends(get_current_user)
):
    """Create a new test session"""
    try:
        # Check if resume is complete
        profile_res = supabase_client.table("profiles").select("resume_completed").eq("id", current_user.id).single().execute()
        if not profile_res.data or not profile_res.data.get('resume_completed'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Resume must be completed before taking tests"
            )
        
        # Check retake policy (DISABLED FOR DEVELOPMENT)
        # Uncomment to enable in production
        """
        last_test_res = supabase_client.table("candidate_tests").select("*").eq(
            "candidate_id", current_user.id
        ).eq("language", request.language).order("started_at", desc=True).limit(1).execute()
        
        if last_test_res.data:
            last_test = last_test_res.data[0]
            if last_test['status'] == 'in_progress':
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={'reason': 'You have an active test session for this language'}
                )
            
            # Check 24-hour cooldown (DISABLED FOR DEVELOPMENT)
            # Uncomment the lines below to enable in production
            started_at = datetime.fromisoformat(last_test['started_at'].replace('Z', '+00:00'))
            time_since = datetime.utcnow() - started_at.replace(tzinfo=None)
            if time_since < timedelta(hours=24):
                hours_remaining = round(24 - (time_since.total_seconds() / 3600), 1)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={'reason': f'You can only take one test per language per day. Try again in {hours_remaining} hours.'}
                )
        """
        
        # Get language config
        lang_res = supabase_client.table("test_languages").select("*").eq("language_code", request.language).single().execute()
        if not lang_res.data:
            raise HTTPException(status_code=404, detail=f"Language '{request.language}' not found")
        
        lang_config = lang_res.data
        
        # Create test session
        test_id = str(uuid.uuid4())
        test_data = {
            'id': test_id,
            'candidate_id': str(current_user.id),
            'language': request.language,
            'started_at': datetime.utcnow().isoformat(),
            'duration_minutes': lang_config['default_duration_minutes'],
            'total_questions': lang_config['default_question_count'],
            'status': 'in_progress'
        }
        
        supabase_client.table("candidate_tests").insert(test_data).execute()
        
        # Update total questions count in test data if we only do MCQs
        total_qcount = lang_config['default_question_count']
        
        # Generate AI Questions (MCQs only for now as per AI Quiz Bot feature)
        ai_questions = generate_ai_mcqs(
            topic=lang_config['display_name'],
            difficulty="intermediate",
            num_questions=total_qcount
        )
        
        # Insert AI questions
        for i, q in enumerate(ai_questions):
            question_data = {
                'test_id': test_id,
                'question_number': i + 1,
                'question_type': 'mcq',
                'question_text': q['question'],
                'options': q['options'],
                'correct_option': q['correct_index']
            }
            supabase_client.table("test_questions").insert(question_data).execute()
        
        # Update test record with actual question count if it differs
        if len(ai_questions) != total_qcount:
            supabase_client.table("candidate_tests").update({
                'total_questions': len(ai_questions)
            }).eq("id", test_id).execute()
            test_data['total_questions'] = len(ai_questions)
        
        return {
            'test_id': test_id,
            'language': request.language,
            'duration_minutes': test_data['duration_minutes'],
            'total_questions': test_data['total_questions'],
            'started_at': test_data['started_at']
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{test_id}")
async def get_test(
    test_id: str,
    current_user = Depends(get_current_user)
):
    """Get test details and questions"""
    try:
        test_res = supabase_client.table("candidate_tests").select("*").eq("id", test_id).eq("candidate_id", current_user.id).single().execute()
        if not test_res.data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        questions_res = supabase_client.table("test_questions").select("*").eq("test_id", test_id).order("question_number").execute()
        
        return {
            'quiz': {
                'id': test_res.data['id'],
                'language': test_res.data['language'],
                'status': test_res.data['status'],
                'duration_minutes': test_res.data['duration_minutes'],
                'started_at': test_res.data['started_at']
            },
            'questions': [
                {
                    'id': q['id'],
                    'number': q['question_number'],
                    'type': q['question_type'],
                    'question_text': q['question_text'],
                    'options': q.get('options'),
                    'code_template': q.get('code_template')
                }
                for q in (questions_res.data or [])
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{test_id}/submit-answer")
async def submit_answer(
    test_id: str,
    request: SubmitAnswerRequest,
    current_user = Depends(get_current_user)
):
    """Submit an answer"""
    try:
        # Get question to check correct answer
        question_res = supabase_client.table("test_questions").select("*").eq("id", request.question_id).single().execute()
        if not question_res.data:
            raise HTTPException(status_code=404, detail="Question not found")
        
        question = question_res.data
        
        # Check if correct
        is_correct = False
        if question['question_type'] == 'mcq':
            is_correct = request.selected_option == question.get('correct_option')
        elif question['question_type'] == 'coding':
            is_correct = bool(request.code_submission)  # Mock: any code is correct
        
        # Save answer
        answer_data = {
            'id': str(uuid.uuid4()),
            'test_id': test_id,
            'question_id': request.question_id,
            'selected_option': request.selected_option,
            'code_submission': request.code_submission,
            'answer_text': request.answer_text,
            'is_correct': is_correct,
            'points_earned': 10.0 if is_correct else 0.0,
            'time_spent_seconds': request.time_spent_seconds
        }
        
        supabase_client.table("test_answers").insert(answer_data).execute()
        
        return {'answer_id': answer_data['id'], 'submitted': True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{test_id}/complete")
async def complete_test(
    test_id: str,
    current_user = Depends(get_current_user)
):
    """Complete the test and get results"""
    try:
        # Get test
        test_res = supabase_client.table("candidate_tests").select("*").eq("id", test_id).single().execute()
        if not test_res.data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        test = test_res.data
        
        # Get answers
        answers_res = supabase_client.table("test_answers").select("*").eq("test_id", test_id).execute()
        answers = answers_res.data or []
        
        # Calculate score
        correct_count = sum(1 for ans in answers if ans.get('is_correct'))
        score_percentage = (correct_count / test['total_questions']) * 100 if test['total_questions'] > 0 else 0
        passed = score_percentage >= 80.0
        
        # Update test
        supabase_client.table("candidate_tests").update({
            'correct_answers': correct_count,
            'score_percentage': score_percentage,
            'passed': passed,
            'status': 'completed',
            'completed_at': datetime.utcnow().isoformat()
        }).eq("id", test_id).execute()
        
        # Update profile if passed (trigger should handle this, but doing it manually as backup)
        if passed:
            supabase_client.table("profiles").update({
                'interview_eligible': True,
                'test_status': 'passed',
                'last_test_date': datetime.utcnow().isoformat()
            }).eq("id", current_user.id).execute()
        
        return {
            'test_id': test_id,
            'score_percentage': float(score_percentage),
            'passed': passed,
            'correct_answers': correct_count,
            'total_questions': test['total_questions']
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error completing test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{test_id}/report")
async def get_test_report(
    test_id: str,
    current_user = Depends(get_current_user)
):
    """Get detailed test report"""
    try:
        test_res = supabase_client.table("candidate_tests").select("*").eq("id", test_id).single().execute()
        if not test_res.data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        test = test_res.data
        
        answers_res = supabase_client.table("test_answers").select("*").eq("test_id", test_id).execute()
        
        return {
            'id': test['id'],
            'language': test['language'],
            'score_percentage': float(test.get('score_percentage', 0)),
            'passed': test.get('passed', False),
            'completed_at': test.get('completed_at'),
            'total_questions': test['total_questions'],
            'correct_answers': test.get('correct_answers', 0),
            'question_results': [
                {
                    'question_id': ans['question_id'],
                    'correct': ans.get('is_correct', False),
                    'time_spent': ans.get('time_spent_seconds', 0)
                }
                for ans in (answers_res.data or [])
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_test_history(
    current_user = Depends(get_current_user)
):
    """Get candidate's test history"""
    try:
        tests_res = supabase_client.table("candidate_tests").select("*").eq(
            "candidate_id", current_user.id
        ).eq("status", "completed").order("completed_at", desc=True).execute()
        
        return {
            'tests': [
                {
                    'id': t['id'],
                    'language': t['language'],
                    'score_percentage': float(t.get('score_percentage', 0)),
                    'passed': t.get('passed', False),
                    'completed_at': t.get('completed_at')
                }
                for t in (tests_res.data or [])
            ]
        }
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
