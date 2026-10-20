from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Question, Option, Exam, ExamAttempt, StudentAnswer, ExamResult


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Platform Role', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Platform Role', {'fields': ('role',)}),
    )


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'question_type', 'difficulty', 'marks', 'question_text')
    list_filter = ('subject', 'question_type', 'difficulty')
    search_fields = ('question_text', 'subject')
    inlines = [OptionInline]


class ExamAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'subject', 'duration_minutes', 'total_marks', 'passing_marks', 'is_published', 'created_at')
    list_filter = ('subject', 'is_published')
    search_fields = ('title', 'subject')
    filter_horizontal = ('questions',)


class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'exam', 'attempt_number', 'status', 'start_time', 'end_time')
    list_filter = ('status', 'exam')
    search_fields = ('student__username', 'exam__title')


class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'attempt', 'question', 'selected_option', 'is_correct', 'marks_obtained', 'saved_at')
    list_filter = ('is_correct',)


class ExamResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'exam', 'score', 'total_marks', 'percentage', 'passed', 'submitted_at')
    list_filter = ('passed', 'exam')
    search_fields = ('student__username', 'exam__title')


admin.site.register(User, CustomUserAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Option)
admin.site.register(Exam, ExamAdmin)
admin.site.register(ExamAttempt, ExamAttemptAdmin)
admin.site.register(StudentAnswer, StudentAnswerAdmin)
admin.site.register(ExamResult, ExamResultAdmin)
