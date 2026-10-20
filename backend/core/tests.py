import json
from datetime import timedelta
from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Question, Option, Exam, ExamAttempt, StudentAnswer, ExamResult

class OnlineExaminationPlatformTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Admin
        self.admin_user = User.objects.create_user(
            username='admin_tester',
            email='admin_tester@example.com',
            password='testpassword123',
            role=User.ROLE_ADMIN,
            is_staff=True
        )

        # Create Student
        self.student_user = User.objects.create_user(
            username='student_tester',
            email='student_tester@example.com',
            password='testpassword123',
            role=User.ROLE_STUDENT
        )

        # Setup Question 1: MCQ (2 marks)
        self.q1 = Question.objects.create(
            subject='Python Programming',
            question_type=Question.TYPE_MCQ,
            difficulty='EASY',
            marks=2,
            question_text='What is the output of print(2 ** 3)?'
        )
        self.q1_opt1 = Option.objects.create(question=self.q1, option_text='6', is_correct=False, order=0)
        self.q1_opt2 = Option.objects.create(question=self.q1, option_text='8', is_correct=True, order=1)
        self.q1_opt3 = Option.objects.create(question=self.q1, option_text='9', is_correct=False, order=2)
        self.q1_opt4 = Option.objects.create(question=self.q1, option_text='5', is_correct=False, order=3)

        # Setup Question 2: True/False (1 mark)
        self.q2 = Question.objects.create(
            subject='Python Programming',
            question_type=Question.TYPE_TF,
            difficulty='EASY',
            marks=1,
            question_text='Python is a statically typed programming language.'
        )
        self.q2_opt1 = Option.objects.create(question=self.q2, option_text='True', is_correct=False, order=0)
        self.q2_opt2 = Option.objects.create(question=self.q2, option_text='False', is_correct=True, order=1)

        # Setup Exam (Total marks = 3, Passing marks = 2)
        self.exam = Exam.objects.create(
            title='Python Fundamentals Assessment',
            description='Test basic Python concepts',
            subject='Python Programming',
            duration_minutes=30,
            total_marks=3,
            passing_marks=2,
            max_attempts=2,
            is_published=True,
            created_by=self.admin_user
        )
        self.exam.questions.set([self.q1, self.q2])

    def test_01_role_based_access_control(self):
        """Test RBAC: Students are forbidden from admin endpoints"""
        self.client.force_authenticate(user=self.student_user)

        # Student cannot create questions
        res = self.client.post('/api/questions/', {
            'subject': 'Test',
            'question_type': 'MCQ',
            'marks': 1,
            'question_text': 'Unauthorized question?',
            'options': [{'option_text': 'A', 'is_correct': True}, {'option_text': 'B', 'is_correct': False}]
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Student cannot publish exams
        res = self.client.post(f'/api/exams/{self.exam.id}/publish/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access admin check
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get('/api/auth/admin-check/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_02_student_available_exams(self):
        """Test that students can view published exams, but not unpublished drafts"""
        # Create draft exam
        draft_exam = Exam.objects.create(
            title='Draft Exam Not Ready',
            subject='Python',
            duration_minutes=10,
            is_published=False,
            created_by=self.admin_user
        )

        self.client.force_authenticate(user=self.student_user)
        res = self.client.get('/api/exams/available/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        exam_ids = [e['id'] for e in res.data]
        self.assertIn(self.exam.id, exam_ids)
        self.assertNotIn(draft_exam.id, exam_ids)

    def test_03_security_correct_answers_never_leaked_during_exam(self):
        """CRITICAL SECURITY TEST: Ensure is_correct is NEVER leaked to students in exam payload"""
        self.client.force_authenticate(user=self.student_user)
        res = self.client.post(f'/api/exams/{self.exam.id}/start/')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.data

        # Check questions in payload
        self.assertIn('questions', data)
        for q in data['questions']:
            self.assertNotIn('correct_option_id', q)
            self.assertNotIn('correct_option_text', q)
            for opt in q['options']:
                self.assertNotIn('is_correct', opt)

    def test_04_autosave_answer_and_state_restoration(self):
        """Test autosaving answers to PostgreSQL and restoring state upon resumption"""
        self.client.force_authenticate(user=self.student_user)
        start_res = self.client.post(f'/api/exams/{self.exam.id}/start/')
        attempt_id = start_res.data['id']

        # Autosave answer for Q1
        save_res = self.client.post(f'/api/attempts/{attempt_id}/autosave/', {
            'question_id': self.q1.id,
            'selected_option_id': self.q1_opt2.id
        }, format='json')
        self.assertEqual(save_res.status_code, status.HTTP_200_OK)
        self.assertTrue(save_res.data['saved'])

        # Verify persisted in database
        saved_db_ans = StudentAnswer.objects.get(attempt_id=attempt_id, question_id=self.q1.id)
        self.assertEqual(saved_db_ans.selected_option_id, self.q1_opt2.id)

        # Resume attempt (simulate page refresh)
        resume_res = self.client.post(f'/api/exams/{self.exam.id}/start/')
        self.assertEqual(resume_res.status_code, status.HTTP_200_OK)
        saved_ans = resume_res.data['saved_answers']
        ans_val = saved_ans.get(self.q1.id) if self.q1.id in saved_ans else saved_ans.get(str(self.q1.id))
        self.assertEqual(ans_val, self.q1_opt2.id)

    def test_05_server_side_evaluation_and_scoring(self):
        """Test automatic grading, score calculation, and pass/fail evaluation"""
        self.client.force_authenticate(user=self.student_user)
        start_res = self.client.post(f'/api/exams/{self.exam.id}/start/')
        attempt_id = start_res.data['id']

        # Answer Q1 correctly (2 marks)
        self.client.post(f'/api/attempts/{attempt_id}/autosave/', {
            'question_id': self.q1.id,
            'selected_option_id': self.q1_opt2.id
        }, format='json')

        # Answer Q2 correctly (1 mark)
        self.client.post(f'/api/attempts/{attempt_id}/autosave/', {
            'question_id': self.q2.id,
            'selected_option_id': self.q2_opt2.id
        }, format='json')

        # Submit attempt
        submit_res = self.client.post(f'/api/attempts/{attempt_id}/submit/')
        self.assertEqual(submit_res.status_code, status.HTTP_200_OK)
        result_data = submit_res.data['result']

        self.assertEqual(result_data['score'], 3.0)
        self.assertEqual(result_data['total_marks'], 3.0)
        self.assertEqual(result_data['percentage'], 100.0)
        self.assertTrue(result_data['passed'])
        self.assertEqual(result_data['correct_answers'], 2)
        self.assertEqual(result_data['wrong_answers'], 0)
        self.assertEqual(result_data['unanswered'], 0)

        # After submission, answers_review DOES reveal correct solutions
        self.assertIn('answers_review', result_data)
        review_q1 = next(item for item in result_data['answers_review'] if item['question_id'] == self.q1.id)
        self.assertTrue(review_q1['is_correct'])
        self.assertEqual(review_q1['correct_option_id'], self.q1_opt2.id)

    def test_06_duplicate_submission_prevention(self):
        """Test that submitting an already submitted exam is rejected or handled idempotently"""
        self.client.force_authenticate(user=self.student_user)
        start_res = self.client.post(f'/api/exams/{self.exam.id}/start/')
        attempt_id = start_res.data['id']

        # First submission
        res1 = self.client.post(f'/api/attempts/{attempt_id}/submit/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        # Second submission
        res2 = self.client.post(f'/api/attempts/{attempt_id}/submit/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.data.get('already_submitted'))

    def test_07_timer_expiry_handling(self):
        """Test that attempts with expired time limit are marked EXPIRED and auto-evaluated"""
        self.client.force_authenticate(user=self.student_user)
        start_res = self.client.post(f'/api/exams/{self.exam.id}/start/')
        attempt_id = start_res.data['id']

        # Artificially age the attempt start_time to 40 minutes ago (exam duration is 30 mins)
        attempt = ExamAttempt.objects.get(id=attempt_id)
        attempt.start_time = timezone.now() - timedelta(minutes=40)
        attempt.save(update_fields=['start_time'])

        self.assertTrue(attempt.is_time_expired())

        # Attempt to autosave should detect expiry and auto-submit
        save_res = self.client.post(f'/api/attempts/{attempt_id}/autosave/', {
            'question_id': self.q1.id,
            'selected_option_id': self.q1_opt1.id
        }, format='json')
        self.assertEqual(save_res.status_code, status.HTTP_200_OK)
        self.assertTrue(save_res.data.get('expired'))

        # Attempt status in DB should now be EXPIRED
        attempt.refresh_from_db()
        self.assertEqual(attempt.status, ExamAttempt.STATUS_EXPIRED)
        self.assertTrue(hasattr(attempt, 'result'))
