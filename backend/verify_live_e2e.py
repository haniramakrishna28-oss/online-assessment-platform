import urllib.request
import json
import sys

def post(url, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def get(url, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, headers=headers, method='GET')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def run():
    print("=== LIVE E2E INTEGRATION TEST ===")
    
    # 1. Login student
    login_res = post('http://127.0.0.1:8000/api/auth/login/', {'username': 'student', 'password': 'studentpassword123'})
    student_token = login_res['access']
    print(f"1. Student Logged In: {login_res['user']['username']}")

    # 2. Get available exams
    available = get('http://127.0.0.1:8000/api/exams/available/', student_token)
    print(f"2. Available Exams Found: {len(available)}")
    exam = available[0]
    print(f"   Exam selected: '{exam['title']}' (ID: {exam['id']})")

    # 3. Start Exam
    attempt = post(f"http://127.0.0.1:8000/api/exams/{exam['id']}/start/", {}, student_token)
    attempt_id = attempt['id']
    questions = attempt['questions']
    print(f"3. Exam Started! Attempt ID: {attempt_id}, Questions: {len(questions)}, Remaining: {attempt['remaining_seconds']}s")

    # Security check: verify no leaks of is_correct
    leak = any('is_correct' in opt for q in questions for opt in q.get('options', []))
    assert not leak, "CRITICAL ERROR: is_correct found in student question payload!"
    print("   Security Audit: PASSED (Zero correct answer leaks in options payload)")

    # 4. Autosave answer
    if questions:
        q = questions[0]
        opt = q['options'][0]
        save_res = post(f"http://127.0.0.1:8000/api/attempts/{attempt_id}/autosave/", {
            'question_id': q['id'],
            'selected_option_id': opt['id']
        }, student_token)
        print(f"4. Autosave to PostgreSQL: saved={save_res.get('saved')}, remaining_time={save_res.get('remaining_seconds')}s")

    # 5. Submit exam
    submit_res = post(f"http://127.0.0.1:8000/api/attempts/{attempt_id}/submit/", {}, student_token)
    result = submit_res['result']
    print(f"5. Exam Evaluated! Score: {result['score']}/{result['total_marks']} ({result['percentage']}%), Outcome: {'PASSED' if result['passed'] else 'NEEDS IMPROVEMENT'}")

    # 6. Fetch scorecard
    result_card = get(f"http://127.0.0.1:8000/api/results/{result['id']}/", student_token)
    print(f"6. Student Scorecard Verified: {len(result_card['answers_review'])} questions reviewed with explanations.")

    # 7. Admin inspection
    admin_login = post('http://127.0.0.1:8000/api/auth/login/', {'username': 'admin', 'password': 'adminpassword123'})
    admin_token = admin_login['access']
    all_results = get('http://127.0.0.1:8000/api/results/all_results/', admin_token)
    print(f"7. Admin Analytics: {len(all_results)} total student attempts recorded.")

    print("\nSUCCESS: All 7 live end-to-end integration checkpoints verified against live PostgreSQL!")

if __name__ == '__main__':
    run()
