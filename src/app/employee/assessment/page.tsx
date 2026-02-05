'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/common/Button';
import RadioOption from '@/components/common/RadioOption';
import ProgressBar from '@/components/common/ProgressBar';
import PrivacyNote from '@/components/common/PrivacyNote';
import { assessmentQuestions, calculateAssessmentScore, assignModulesFromScore } from '@/lib/assessment-data';

export default function AssessmentPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      // Calculate score and show results
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleComplete = () => {
    const score = calculateAssessmentScore(answers);
    const assignedModules = assignModulesFromScore(score, answers);
    
    // In a real app, save to backend
    console.log('Assessment Score:', score);
    console.log('Assigned Modules:', assignedModules);
    
    // Redirect to dashboard
    router.push('/employee/dashboard');
  };

  if (showResults) {
    const score = calculateAssessmentScore(answers);
    const assignedModules = assignModulesFromScore(score, answers);

    return (
      <DashboardLayout title="Assessment Results" role="employee">
        <div className="max-w-3xl mx-auto">
          {/* Results Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
              <p className="text-gray-600">Thank you for completing your Peace of Mind Assessment</p>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 mb-8">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Readiness Score</p>
                <p className="text-6xl font-bold text-blue-600 mb-2">{score}</p>
                <p className="text-sm text-gray-600">out of 100</p>
              </div>
            </div>

            {/* Assigned Modules */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Personalized Learning Path</h2>
              <p className="text-gray-600 mb-4">
                Based on your answers, we've created a customized learning path with {assignedModules.length} modules
                to help you improve your legacy readiness.
              </p>

              <div className="space-y-3">
                {assignedModules.map((moduleId, index) => (
                  <div key={moduleId} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Module {moduleId.replace('module-', '')}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        Assigned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note */}
            <PrivacyNote>
              <p>
                <strong>Your privacy is protected.</strong> Your detailed answers are private and only visible to you.
                HR admins can only see that you completed the assessment, not your individual responses.
              </p>
            </PrivacyNote>

            {/* Action Button */}
            <div className="mt-8">
              <Button variant="primary" fullWidth onClick={handleComplete}>
                Start Your Learning Journey →
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Peace of Mind Assessment" role="employee">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Peace of Mind Assessment</h1>
          <p className="text-gray-600 mb-4">
            This helps us create a personalized learning path for your legacy readiness journey
          </p>
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            color="blue"
            size="lg"
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{currentQuestion.questionText}</h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => (
              <RadioOption
                key={option.id}
                value={option.value}
                selected={currentAnswer === option.value}
                onChange={handleAnswerChange}
              >
                {option.label}
              </RadioOption>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              {isLastQuestion ? 'Complete Assessment' : 'Next →'}
            </Button>
          </div>
        </div>

        {/* Privacy Note */}
        <PrivacyNote>
          <strong>Privacy Note:</strong> Your answers are private and secure. HR only sees completion status,
          not your individual responses.
        </PrivacyNote>
      </div>
    </DashboardLayout>
  );
}
