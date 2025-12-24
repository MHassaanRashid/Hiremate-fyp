from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.candidate_test import CandidateTest, TestQuestion, TestAnswer, TestLanguage
from app.models.profiles import Profiles
from fastapi import HTTPException, status
import uuid

class TestService:
    """Service for managing candidate tests"""
    
    @staticmethod
    def can_take_test(candidate_id: str, language: str, db: Session) -> Dict:
        """
        Check if candidate can take a test for the given language.
        Enforces: One test per language per day.
        """
        last_test = db.query(CandidateTest).filter(
            and_(
                CandidateTest.candidate_id == candidate_id,
                CandidateTest.language == language,
                CandidateTest.status.in_(['completed', 'in_progress'])
            )
        ).order_by(CandidateTest.started_at.desc()).first()
        
        if not last_test:
            return {'allowed': True, 'reason': None}
        
        # Check if there's a test in progress
        if last_test.status == 'in_progress':
            return {
                'allowed': False,
                'reason': 'You have an active test session for this language',
                'retry_after': None
            }
        
        # Check 24-hour cooldown
        time_since_last = datetime.utcnow() - last_test.started_at
        if time_since_last < timedelta(hours=24):
            retry_after = last_test.started_at + timedelta(hours=24)
            hours_remaining = round(24 - (time_since_last.total_seconds() / 3600), 1)
            return {
                'allowed': False,
                'reason': f'You can only take one test per language per day. Try again in {hours_remaining} hours.',
                'retry_after': retry_after.isoformat(),
                'hours_remaining': hours_remaining
            }
        
        return {'allowed': True, 'reason': None}
    
    @staticmethod
    def create_test_session(candidate_id: str, language: str, db: Session) -> CandidateTest:
        """Create a new test session with mock questions"""
        # Get language config
        lang_config = db.query(TestLanguage).filter(
            TestLanguage.language_code == language
        ).first()
        
        if not lang_config or not lang_config.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Language '{language}' not found or not active"
            )
        
        # Create test session
        test = CandidateTest(
            id=uuid.uuid4(),
            candidate_id=candidate_id,
            language=language,
            started_at=datetime.utcnow(),
            duration_minutes=lang_config.default_duration_minutes,
            total_questions=lang_config.default_question_count,
            status='in_progress'
        )
        db.add(test)
        db.commit()
        db.refresh(test)
        
        # Generate mock questions (placeholder for AI)
        TestService._generate_mock_questions(test.id, lang_config.default_question_count, language, db)
        
        return test
    
    @staticmethod
    def _generate_mock_questions(test_id: uuid.UUID, count: int, language: str, db: Session):
        """
        Generate mock questions (placeholder for AI).
        In future, this will call AI service to generate questions.
        """
        # Mock question templates
        mcq_template = {
            'js': [
                {
                    'text': 'What is the output of: console.log(typeof null)?',
                    'options': ['object', 'null', 'undefined', 'number'],
                    'correct': 0
                },
                {
                    'text': 'Which method is used to add elements to the end of an array?',
                    'options': ['push()', 'pop()', 'shift()', 'unshift()'],
                    'correct': 0
                },
            ],
            'py': [
                {
                    'text': 'What is the output of: print(type([]))?',
                    'options': ['<class \'list\'>', '<class \'array\'>', '<class \'tuple\'>', '<class \'dict\'>'],
                    'correct': 0
                },
                {
                    'text': 'Which keyword is used to create a function in Python?',
                    'options': ['def', 'function', 'func', 'define'],
                    'correct': 0
                },
            ]
        }
        
        # Get language-specific templates or use generic
        templates = mcq_template.get(language, mcq_template['js'])
        
        # Create 7 MCQ questions
        for i in range(min(7, count)):
            template = templates[i % len(templates)]
            question = TestQuestion(
                test_id=test_id,
                question_number=i + 1,
                question_type='mcq',
                question_text=template['text'],
                options=template['options'],
                correct_option=template['correct'],
                difficulty_level='medium',
                ai_generated=False
            )
            db.add(question)
        
        # Create 3 coding questions (simplified for mock)
        for i in range(7, count):
            question = TestQuestion(
                test_id=test_id,
                question_number=i + 1,
                question_type='coding',
                question_text=f'Write a function to solve problem {i - 6}',
                code_template=f'// Write your {language} code here',
                test_cases=[
                    {'input': '1', 'expected': '1'},
                    {'input': '2', 'expected': '2'}
                ],
                difficulty_level='medium',
                ai_generated=False
            )
            db.add(question)
        
        db.commit()
    
    @staticmethod
    def submit_answer(test_id: str, question_id: str, answer_data: Dict, db: Session) -> TestAnswer:
        """Submit an answer to a question"""
        question = db.query(TestQuestion).filter(TestQuestion.id == question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        # Check if answer is correct (mock evaluation)
        is_correct = False
        if question.question_type == 'mcq':
            is_correct = answer_data.get('selected_option') == question.correct_option
        elif question.question_type == 'coding':
            # Mock: For now, accept any code submission as correct
            is_correct = bool(answer_data.get('code_submission'))
        
        answer = TestAnswer(
            test_id=test_id,
            question_id=question_id,
            selected_option=answer_data.get('selected_option'),
            code_submission=answer_data.get('code_submission'),
            answer_text=answer_data.get('answer_text'),
            is_correct=is_correct,
            points_earned=10.0 if is_correct else 0.0,
            time_spent_seconds=answer_data.get('time_spent_seconds', 0)
        )
        db.add(answer)
        db.commit()
        db.refresh(answer)
        return answer
    
    @staticmethod
    def complete_test(test_id: str, db: Session) -> Dict:
        """Complete a test and calculate score"""
        test = db.query(CandidateTest).filter(CandidateTest.id == test_id).first()
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
        
        if test.status == 'completed':
            raise HTTPException(status_code=400, detail="Test already completed")
        
        answers = db.query(TestAnswer).filter(TestAnswer.test_id == test_id).all()
        
        correct_count = sum(1 for ans in answers if ans.is_correct)
        score_percentage = (correct_count / test.total_questions) * 100 if test.total_questions > 0 else 0
        passed = score_percentage >= 80.0  # 80% passing threshold
        
        # Update test record
        test.correct_answers = correct_count
        test.score_percentage = score_percentage
        test.passed = passed
        test.status = 'completed'
        test.completed_at = datetime.utcnow()
        
        db.commit()
        
        # Note: The database trigger will automatically update profile.interview_eligible if passed
        
        return {
            'test_id': str(test.id),
            'score_percentage': float(score_percentage),
            'passed': passed,
            'correct_answers': correct_count,
            'total_questions': test.total_questions
        }
    
    @staticmethod
    def get_test_report(test_id: str, db: Session) -> Dict:
        """Get detailed test report (without AI metrics)"""
        test = db.query(CandidateTest).filter(CandidateTest.id == test_id).first()
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
        
        answers = db.query(TestAnswer).filter(
            TestAnswer.test_id == test_id
        ).all()
        
        return {
            'id': str(test.id),
            'language': test.language,
            'score_percentage': float(test.score_percentage),
            'passed': test.passed,
            'completed_at': test.completed_at.isoformat() if test.completed_at else None,
            'total_questions': test.total_questions,
            'correct_answers': test.correct_answers,
            'question_results': [
                {
                    'question_id': str(ans.question_id),
                    'correct': ans.is_correct,
                    'time_spent': ans.time_spent_seconds
                }
                for ans in answers
            ]
            # Note: AI metrics are intentionally hidden until AI is implemented
        }
    
    @staticmethod
    def get_test_history(candidate_id: str, db: Session) -> List[Dict]:
        """Get candidate's test history"""
        tests = db.query(CandidateTest).filter(
            CandidateTest.candidate_id == candidate_id,
            CandidateTest.status == 'completed'
        ).order_by(CandidateTest.completed_at.desc()).all()
        
        return [
            {
                'id': str(t.id),
                'language': t.language,
                'score_percentage': float(t.score_percentage),
                'passed': t.passed,
                'completed_at': t.completed_at.isoformat() if t.completed_at else None
            }
            for t in tests
        ]
