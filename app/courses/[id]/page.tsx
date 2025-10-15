'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, CourseChapter, CourseContent } from '@/lib/api';

interface Course {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<CourseContent | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCourse(token);
  }, [courseId, router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && videoModalOpen) {
        closeVideoModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [videoModalOpen]);

  const fetchCourse = async (token: string) => {
    try {
      const courseData = await apiClient.getCourse(Number(courseId), token);
      setCourse(courseData);

      // Fetch chapters for the course
      const chaptersData = await apiClient.getCourseChapters(Number(courseId), token);
      setChapters(chaptersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course';

      // Check if it's an authentication error
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = async (chapterId: number) => {
    if (expandedChapter === chapterId) {
      setExpandedChapter(null);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      // Fetch chapter with contents if not already loaded
      const chapter = chapters.find(ch => ch.id === chapterId);
      if (chapter && !chapter.contents) {
        const chapterWithContents = await apiClient.getChapterWithContents(chapterId, token);
        setChapters(prev => prev.map(ch =>
          ch.id === chapterId ? chapterWithContents : ch
        ));
      }
      setExpandedChapter(chapterId);
    } catch (err) {
      console.error('Failed to fetch chapter contents:', err);
    }
  };

  const getVideoEmbedUrl = (url: string): { type: 'youtube' | 'vimeo' | 'direct'; embedUrl: string } | null => {
    if (!url) return null;

    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      };
    }

    // Vimeo patterns
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // Direct video file
    return {
      type: 'direct',
      embedUrl: url
    };
  };

  const openVideoModal = (content: CourseContent) => {
    setCurrentVideo(content);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setCurrentVideo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Course not found'}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-800 dark:text-green-300 font-medium">
                Successfully enrolled in this course!
              </p>
            </div>
          </div>

          {/* Course Details */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {course.name}
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {course.description}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Course Information
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Course ID</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{course.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(course.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(course.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Course Chapters */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Course Content
            </h2>
            {chapters.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No chapters available yet.</p>
            ) : (
              <div className="space-y-3">
                {chapters
                  .sort((a, b) => a.chapter_order - b.chapter_order)
                  .map((chapter) => (
                    <div
                      key={chapter.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      {/* Chapter Header */}
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-semibold text-sm">
                            {chapter.chapter_order}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {chapter.title}
                            </h3>
                            {chapter.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {chapter.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                            expandedChapter === chapter.id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Chapter Contents */}
                      {expandedChapter === chapter.id && chapter.contents && (
                        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          {chapter.contents.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              No content available for this chapter yet.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {chapter.contents
                                .sort((a, b) => a.content_order - b.content_order)
                                .map((content) => (
                                  <div
                                    key={content.id}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                  >
                                    {/* Content Type Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                      {content.content_type === 'video' && (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      {content.content_type === 'text' && (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      )}
                                      {content.content_type === 'pdf' && (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                      {content.content_type === 'link' && (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                      )}
                                      {(content.content_type === 'image' || content.content_type === 'audio' || content.content_type === 'document') && (
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      )}
                                    </div>

                                    {/* Content Details */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 dark:text-white">
                                        {content.title}
                                      </h4>
                                      {content.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {content.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                                          {content.content_type}
                                        </span>
                                        {content.duration_minutes && (
                                          <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {content.duration_minutes} min
                                          </span>
                                        )}
                                      </div>

                                      {/* Video Player Button */}
                                      {content.content_type === 'video' && content.file_url && (
                                        <button
                                          onClick={() => openVideoModal(content)}
                                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                          </svg>
                                          Watch Video
                                        </button>
                                      )}

                                      {/* Link for non-video content */}
                                      {content.file_url && content.content_type !== 'video' && (
                                        <a
                                          href={content.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                          Open content
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Modal */}
      {videoModalOpen && currentVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={closeVideoModal}
        >
          <div
            className="relative w-full max-w-5xl bg-gray-900 rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {currentVideo.title}
              </h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Video Player */}
            <div className="p-4">
              {(() => {
                const videoInfo = currentVideo.file_url ? getVideoEmbedUrl(currentVideo.file_url) : null;
                if (!videoInfo) return null;

                if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') {
                  return (
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={videoInfo.embedUrl}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentVideo.title}
                      />
                    </div>
                  );
                }

                return (
                  <video
                    controls
                    autoPlay
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: '70vh' }}
                  >
                    <source src={videoInfo.embedUrl} type="video/mp4" />
                    <source src={videoInfo.embedUrl} type="video/webm" />
                    <source src={videoInfo.embedUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                );
              })()}

              {/* Video Description */}
              {currentVideo.description && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-300">{currentVideo.description}</p>
                </div>
              )}

              {/* Video Info */}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                <span className="px-2 py-1 bg-gray-800 rounded capitalize">
                  {currentVideo.content_type}
                </span>
                {currentVideo.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentVideo.duration_minutes} minutes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
