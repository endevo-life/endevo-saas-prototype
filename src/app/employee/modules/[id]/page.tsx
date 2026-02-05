'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PrivacyNote from '@/components/common/PrivacyNote';
import ProgressBar from '@/components/common/ProgressBar';
import { mockModules } from '@/lib/mock-data';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: string;
  completed: boolean;
  content: {
    videoUrl?: string;
    text?: string;
    takeaways: string[];
    reflectionPrompt: string;
  };
}

export default function ModuleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [note, setNote] = useState('');
  const [videoWatched, setVideoWatched] = useState(false);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Find the module
  const module = mockModules.find((m) => m.id === id);

  if (!module) {
    return (
      <DashboardLayout title="Module Not Found" role="employee">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h2>
          <Button variant="primary" onClick={() => router.push('/employee/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Mock lessons based on module
  const lessons: Lesson[] = [
    {
      id: 1,
      title: 'Introduction to ' + module.title,
      type: 'video',
      duration: '3:45',
      completed: checklist[1] || false,
      content: {
        videoUrl: 'https://example.com/intro.mp4',
        takeaways: [
          'Understanding why ' + module.title.toLowerCase() + ' matters',
          'Overview of what you\'ll learn',
          'How this impacts your loved ones',
        ],
        reflectionPrompt: 'What motivated you to start this module?',
      },
    },
    {
      id: 2,
      title: 'Key Concepts',
      type: 'reading',
      duration: '5 min read',
      completed: checklist[2] || false,
      content: {
        text: 'Essential information about ' + module.title.toLowerCase(),
        takeaways: [
          'Core principles explained',
          'Common misconceptions clarified',
          'Best practices to follow',
        ],
        reflectionPrompt: 'Which concept was most surprising to you?',
      },
    },
    {
      id: 3,
      title: 'Practical Steps',
      type: 'video',
      duration: '4:20',
      completed: checklist[3] || false,
      content: {
        videoUrl: 'https://example.com/practical.mp4',
        takeaways: [
          'Step-by-step action plan',
          'Tools and resources you\'ll need',
          'Timeline for completion',
        ],
        reflectionPrompt: 'What will be your first action step?',
      },
    },
    {
      id: 4,
      title: 'Common Pitfalls',
      type: 'reading',
      duration: '4 min read',
      completed: checklist[4] || false,
      content: {
        text: 'Learn from common mistakes',
        takeaways: [
          'Mistakes to avoid',
          'Warning signs to watch for',
          'How to course-correct',
        ],
        reflectionPrompt: 'Have you encountered any of these pitfalls?',
      },
    },
    {
      id: 5,
      title: 'Moving Forward',
      type: 'video',
      duration: '3:15',
      completed: checklist[5] || false,
      content: {
        videoUrl: 'https://example.com/forward.mp4',
        takeaways: [
          'Next steps after this module',
          'Maintaining your progress',
          'Resources for continued learning',
        ],
        reflectionPrompt: 'What will you do differently after completing this module?',
      },
    },
  ];

  const currentLesson = lessons[currentLessonIndex];
  const completedLessons = Object.values(checklist).filter(Boolean).length;
  const moduleProgress = (completedLessons / lessons.length) * 100;

  const handleMarkLessonComplete = () => {
    setChecklist({ ...checklist, [currentLesson.id]: true });
    
    // Auto-advance to next lesson if not the last one
    if (currentLessonIndex < lessons.length - 1) {
      setTimeout(() => {
        setCurrentLessonIndex(currentLessonIndex + 1);
        setVideoWatched(false);
      }, 500);
    } else {
      // All lessons complete
      setShowCompletionModal(true);
    }
  };

  const handleModuleComplete = () => {
    // In real app, save to backend
    console.log('Module completed:', module.id);
    console.log('Notes:', note);
    router.push('/employee/dashboard');
  };

  const simulateVideoWatch = () => {
    // Simulate watching video
    setTimeout(() => {
      setVideoWatched(true);
    }, 2000);
  };

  return (
    <DashboardLayout title={module.title} role="employee">
      <div className="max-w-5xl mx-auto">
        {/* Module Header */}
        <div className="mb-6">
          <nav className="flex items-center text-sm text-gray-600 mb-4">
            <button
              onClick={() => router.push('/employee/dashboard')}
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{module.title}</span>
          </nav>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
              <span className="text-sm text-gray-600">
                {completedLessons} of {lessons.length} lessons complete
              </span>
            </div>
            <ProgressBar current={completedLessons} total={lessons.length} color="blue" showLabel />
          </div>

          {/* Lesson Checklist */}
          <Card padding="sm">
            <h3 className="font-semibold text-gray-900 mb-3">Lessons</h3>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    currentLessonIndex === index
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    checklist[lesson.id]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {checklist[lesson.id] ? '✓' : lesson.id}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-500">
                      {lesson.type === 'video' ? '🎥' : '📄'} {lesson.duration}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Lesson Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Reading Player */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
              
              {currentLesson.type === 'video' ? (
                <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ paddingBottom: '56.25%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={simulateVideoWatch}
                      className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      disabled={videoWatched}
                    >
                      <span className="text-white text-3xl">{videoWatched ? '✓' : '▶'}</span>
                    </button>
                  </div>
                  {videoWatched && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <div className="text-white text-sm">✓ Video completed</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      This is a reading lesson about {currentLesson.title.toLowerCase()}. 
                      In this section, you'll learn essential concepts and practical knowledge 
                      related to {module.title.toLowerCase()}.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Take your time to read through the material carefully. You can take notes 
                      in the section below to help you remember key points.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <span>📖</span>
                    <span>Estimated reading time: {currentLesson.duration}</span>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Key Takeaways</h3>
                <ul className="space-y-2">
                  {currentLesson.content.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span className="text-gray-700">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reflection Prompt */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Reflection</h3>
                <p className="text-gray-600 mb-3">{currentLesson.content.reflectionPrompt}</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your thoughts here... (private notes)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
                <PrivacyNote variant="info">
                  Your notes are completely private. HR only sees completion status, not your content.
                </PrivacyNote>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {currentLessonIndex > 0 && (
                  <Button
                    onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
                    variant="outline"
                  >
                    ← Previous
                  </Button>
                )}
                <div className="flex-1"></div>
                {!checklist[currentLesson.id] && (
                  <Button
                    onClick={handleMarkLessonComplete}
                    variant="primary"
                    disabled={currentLesson.type === 'video' && !videoWatched}
                  >
                    Mark Complete ✓
                  </Button>
                )}
                {currentLessonIndex < lessons.length - 1 && checklist[currentLesson.id] && (
                  <Button
                    onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                    variant="primary"
                  >
                    Next Lesson →
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Module Info */}
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3">Module Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium text-gray-900">{module.estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons:</span>
                  <span className="font-medium text-gray-900">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{module.category}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card padding="sm">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" fullWidth>
                  📥 Download Materials
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  📝 Export Notes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  onClick={() => router.push('/employee/dashboard')}
                >
                  ← Back to Dashboard
                </Button>
              </div>
            </Card>

            {/* Progress Summary */}
            {completedLessons > 0 && (
              <Card padding="sm">
                <h3 className="font-semibold text-gray-900 mb-3">Your Progress</h3>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {Math.round(moduleProgress)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className="text-green-500">✓</span>
                    <span>{completedLessons} lessons completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">○</span>
                    <span>{lessons.length - completedLessons} lessons remaining</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card padding="lg" className="max-w-md w-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Module Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! You've completed all lessons in "{module.title}".
                </p>
                <div className="space-y-3">
                  <Button variant="primary" fullWidth onClick={handleModuleComplete}>
                    Return to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={() => setShowCompletionModal(false)}
                  >
                    Review Lessons
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
