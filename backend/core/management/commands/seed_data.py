from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import User, Question, Option, Exam


class Command(BaseCommand):
    help = "Seeds database with initial users, questions, and sample exams."

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Users
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': User.ROLE_ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin.set_password('adminpassword123')
        admin.save()

        student, _ = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@example.com',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'role': User.ROLE_STUDENT
            }
        )
        student.set_password('studentpassword123')
        student.save()

        self.stdout.write(self.style.SUCCESS("Admin ('admin') and Student ('student') verified."))

        # 2. Questions
        questions_data = [
            # Python Questions
            {
                "subject": "Python",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_EASY,
                "marks": 2,
                "question_text": "Which of the following data structures in Python is immutable?",
                "options": [
                    {"text": "List", "is_correct": False},
                    {"text": "Tuple", "is_correct": True},
                    {"text": "Dictionary", "is_correct": False},
                    {"text": "Set", "is_correct": False},
                ]
            },
            {
                "subject": "Python",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_MEDIUM,
                "marks": 3,
                "question_text": "What is the time complexity of looking up a key in an average Python dictionary?",
                "options": [
                    {"text": "O(1)", "is_correct": True},
                    {"text": "O(n)", "is_correct": False},
                    {"text": "O(log n)", "is_correct": False},
                    {"text": "O(n log n)", "is_correct": False},
                ]
            },
            {
                "subject": "Python",
                "question_type": Question.TYPE_TF,
                "difficulty": Question.DIFF_EASY,
                "marks": 1,
                "question_text": "Python supports multiple inheritance of classes.",
                "options": [
                    {"text": "True", "is_correct": True},
                    {"text": "False", "is_correct": False},
                ]
            },
            {
                "subject": "Python",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_HARD,
                "marks": 4,
                "question_text": "In Python, what is the purpose of the Global Interpreter Lock (GIL)?",
                "options": [
                    {"text": "To prevent multiple threads from executing Python bytecodes simultaneously", "is_correct": True},
                    {"text": "To lock memory allocation permanently across sub-interpreters", "is_correct": False},
                    {"text": "To optimize recursive function depth calls", "is_correct": False},
                    {"text": "To enforce type safety in Python scripts", "is_correct": False},
                ]
            },

            # Web Development
            {
                "subject": "Web Development",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_EASY,
                "marks": 2,
                "question_text": "Which HTTP method is typically used to create a new resource on a RESTful server?",
                "options": [
                    {"text": "GET", "is_correct": False},
                    {"text": "POST", "is_correct": True},
                    {"text": "DELETE", "is_correct": False},
                    {"text": "HEAD", "is_correct": False},
                ]
            },
            {
                "subject": "Web Development",
                "question_type": Question.TYPE_TF,
                "difficulty": Question.DIFF_EASY,
                "marks": 1,
                "question_text": "HTTP status code 404 indicates an Internal Server Error.",
                "options": [
                    {"text": "True", "is_correct": False},
                    {"text": "False", "is_correct": True},
                ]
            },
            {
                "subject": "Web Development",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_MEDIUM,
                "marks": 3,
                "question_text": "What does CORS stand for in web security architecture?",
                "options": [
                    {"text": "Cross-Origin Resource Sharing", "is_correct": True},
                    {"text": "Central Online Routing System", "is_correct": False},
                    {"text": "Cascading Override Resource Sheet", "is_correct": False},
                    {"text": "Client-Originated Request Service", "is_correct": False},
                ]
            },
            {
                "subject": "Web Development",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_HARD,
                "marks": 4,
                "question_text": "Which header prevents MIME-type sniffing vulnerabilities in modern browsers?",
                "options": [
                    {"text": "X-Content-Type-Options: nosniff", "is_correct": True},
                    {"text": "Content-Security-Policy: strict", "is_correct": False},
                    {"text": "X-Frame-Options: DENY", "is_correct": False},
                    {"text": "Access-Control-Allow-Origin: *", "is_correct": False},
                ]
            },

            # Database Systems
            {
                "subject": "Database Systems",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_EASY,
                "marks": 2,
                "question_text": "What does SQL stand for?",
                "options": [
                    {"text": "Structured Query Language", "is_correct": True},
                    {"text": "Sequential Quality Language", "is_correct": False},
                    {"text": "Standard Question List", "is_correct": False},
                    {"text": "System Qualified Logic", "is_correct": False},
                ]
            },
            {
                "subject": "Database Systems",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_MEDIUM,
                "marks": 3,
                "question_text": "In relational databases, which ACID property guarantees that all operations within a transaction succeed or all roll back?",
                "options": [
                    {"text": "Atomicity", "is_correct": True},
                    {"text": "Consistency", "is_correct": False},
                    {"text": "Isolation", "is_correct": False},
                    {"text": "Durability", "is_correct": False},
                ]
            },
            {
                "subject": "Database Systems",
                "question_type": Question.TYPE_TF,
                "difficulty": Question.DIFF_MEDIUM,
                "marks": 2,
                "question_text": "PostgreSQL is an object-relational database management system (ORDBMS).",
                "options": [
                    {"text": "True", "is_correct": True},
                    {"text": "False", "is_correct": False},
                ]
            },

            # Computer Science
            {
                "subject": "Computer Science",
                "question_type": Question.TYPE_MCQ,
                "difficulty": Question.DIFF_MEDIUM,
                "marks": 3,
                "question_text": "Which algorithm finds the shortest path between nodes in a weighted graph with non-negative weights?",
                "options": [
                    {"text": "Dijkstra's Algorithm", "is_correct": True},
                    {"text": "Kruskal's Algorithm", "is_correct": False},
                    {"text": "Depth-First Search", "is_correct": False},
                    {"text": "Breadth-First Search", "is_correct": False},
                ]
            },
        ]

        created_questions = []
        for q_data in questions_data:
            q, created = Question.objects.get_or_create(
                question_text=q_data["question_text"],
                defaults={
                    "subject": q_data["subject"],
                    "question_type": q_data["question_type"],
                    "difficulty": q_data["difficulty"],
                    "marks": q_data["marks"],
                }
            )
            if created or q.options.count() == 0:
                q.options.all().delete()
                for i, opt in enumerate(q_data["options"]):
                    Option.objects.create(
                        question=q,
                        option_text=opt["text"],
                        is_correct=opt["is_correct"],
                        order=i
                    )
            created_questions.append(q)

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(created_questions)} questions with options."))

        # 3. Sample Exam
        now = timezone.now()
        exam, exam_created = Exam.objects.get_or_create(
            title="Full-Stack Engineering Certification Exam",
            defaults={
                "description": "Comprehensive assessment covering Python, Database Systems, Web Security, and Core Computer Science algorithms.",
                "subject": "Computer Science & Engineering",
                "duration_minutes": 15,
                "total_marks": sum(q.marks for q in created_questions),
                "passing_marks": int(sum(q.marks for q in created_questions) * 0.5),
                "start_time": now - timedelta(days=1),
                "end_time": now + timedelta(days=30),
                "max_attempts": 3,
                "is_published": True,
                "created_by": admin
            }
        )
        exam.questions.set(created_questions)
        exam.save()

        # 2nd sample exam (Draft)
        draft_exam, _ = Exam.objects.get_or_create(
            title="Python Advanced Concepts (Draft)",
            defaults={
                "description": "Internal test for advanced Python developers.",
                "subject": "Python",
                "duration_minutes": 10,
                "total_marks": 10,
                "passing_marks": 5,
                "max_attempts": 1,
                "is_published": False,
                "created_by": admin
            }
        )
        python_qs = [q for q in created_questions if q.subject == 'Python']
        draft_exam.questions.set(python_qs)
        draft_exam.save()

        self.stdout.write(self.style.SUCCESS(f"Sample exams created/verified: '{exam.title}' (Published) and '{draft_exam.title}' (Draft)"))
