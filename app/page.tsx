import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col gap-8 items-center max-w-2xl text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to <span className="text-blue-600 dark:text-blue-400">Bahrul Ulum</span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Course Enrollment Management System
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg border-2 border-blue-600 bg-blue-600 transition-colors flex items-center justify-center text-white hover:bg-blue-700 hover:border-blue-700 font-semibold text-base h-12 px-8 w-full sm:w-auto min-w-[160px]"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-lg border-2 border-blue-600 dark:border-blue-400 transition-colors flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold text-base h-12 px-8 w-full sm:w-auto min-w-[160px]"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <ul className="text-left space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Browse and enroll in courses</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Manage your course enrollments</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Role-based access (User, Mentor, Admin)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Secure authentication with JWT</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
        Powered by Next.js & Go
      </footer>
    </div>
  );
}
