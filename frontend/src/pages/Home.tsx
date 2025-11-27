import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Brain, Receipt, Target, BarChart3, Sparkles } from 'lucide-react'
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react'

export function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const isAuthenticated = isLoaded && isSignedIn

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/background.png)',
          opacity: 0.25,
        }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Finance Platform
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Intelligent personal finance management powered by AI. 
              Track expenses, predict spending, and get personalized financial advice.
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignInButton mode="modal">
                  <button className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                    Get Started
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Powerful Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered OCR</h3>
                <p className="text-gray-600">
                  Upload receipt images and let AI extract merchant, date, amount, and category automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Categorization</h3>
                <p className="text-gray-600">
                  Machine learning automatically categorizes your expenses using NLP and Random Forest algorithms.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Spending Predictions</h3>
                <p className="text-gray-600">
                  RNN neural networks predict your future spending patterns to help you plan ahead.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget Tracking</h3>
                <p className="text-gray-600">
                  Set budgets by category and get real-time alerts when you're approaching limits.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Financial Advice</h3>
                <p className="text-gray-600">
                  Get personalized financial recommendations powered by Gemini LLM based on your spending patterns.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Dashboard</h3>
                <p className="text-gray-600">
                  Beautiful charts and visualizations to understand your financial health at a glance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users managing their money smarter with AI.
            </p>
            {!isAuthenticated && (
              <SignUpButton mode="modal">
                <button className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                  Start Free Today
                </button>
              </SignUpButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
