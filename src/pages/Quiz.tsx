import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const Quiz: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const questions: Question[] = [
        {
            id: 1,
            question: 'How often should Diabetrix® typically be taken?',
            options: ['Once daily', 'Twice daily', 'Three times daily', 'As needed'],
            correctAnswer: 0,
            explanation: 'Diabetrix® is designed for once-daily dosing, making it convenient to fit into your daily routine.',
        },
        {
            id: 2,
            question: 'What is the primary purpose of Diabetrix®?',
            options: [
                'To cure Type 2 Diabetes',
                'To help achieve better glycemic control',
                'To replace insulin injections',
                'To prevent Type 2 Diabetes',
            ],
            correctAnswer: 1,
            explanation: 'Diabetrix® helps adults with Type 2 Diabetes achieve better glycemic control by improving the body\'s response to insulin.',
        },
        {
            id: 3,
            question: 'When should you take Diabetrix®?',
            options: ['On an empty stomach', 'With food', 'Before bedtime', 'It doesn\'t matter'],
            correctAnswer: 1,
            explanation: 'Diabetrix® should typically be taken with food to help reduce potential gastrointestinal side effects.',
        },
        {
            id: 4,
            question: 'What should you do if you miss a dose of Diabetrix®?',
            options: [
                'Take two doses at once',
                'Skip it and continue with your regular schedule',
                'Take it as soon as you remember, unless it\'s almost time for the next dose',
                'Stop taking the medication',
            ],
            correctAnswer: 2,
            explanation: 'If you miss a dose, take it as soon as you remember. If it\'s almost time for your next dose, skip the missed dose and continue with your regular schedule.',
        },
        {
            id: 5,
            question: 'Who should NOT take Diabetrix®?',
            options: [
                'People with Type 1 Diabetes',
                'People with severe kidney problems',
                'People allergic to its ingredients',
                'All of the above',
            ],
            correctAnswer: 3,
            explanation: 'Diabetrix® is not suitable for people with Type 1 Diabetes, severe kidney problems, or those allergic to its ingredients. Always consult your healthcare provider.',
        },
    ];

    const handleAnswerSelect = (answerIndex: number) => {
        if (showResult) return;
        setSelectedAnswer(answerIndex);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        if (selectedAnswer === questions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }

        setShowResult(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRestartQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setQuizCompleted(false);
    };

    const getScorePercentage = () => {
        return Math.round((score / questions.length) * 100);
    };

    const getScoreMessage = () => {
        const percentage = getScorePercentage();
        if (percentage >= 80) {
            return { message: 'Excellent!', color: 'text-green-600' };
        } else if (percentage >= 60) {
            return { message: 'Good job!', color: 'text-blue-600' };
        } else {
            return { message: 'Keep learning!', color: 'text-orange-600' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white">
                <div className="flex items-center p-4 border-b border-gray-200">
                    <Link to="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Knowledge Quiz</h1>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <AcademicCapIcon className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Test Your Knowledge About Diabetrix®</h2>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        Answer these questions to see how well you understand Diabetrix® and its proper use.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!quizCompleted ? (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Question {currentQuestion + 1} of {questions.length}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    Score: {score} / {questions.length}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                {questions[currentQuestion].question}
                            </h3>

                            {/* Answer Options */}
                            <div className="space-y-4">
                                {questions[currentQuestion].options.map((option, index) => {
                                    const isSelected = selectedAnswer === index;
                                    const isCorrect = index === questions[currentQuestion].correctAnswer;
                                    const showCorrect = showResult && isCorrect;
                                    const showIncorrect = showResult && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(index)}
                                            disabled={showResult}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                                showCorrect
                                                    ? 'border-green-500 bg-green-50'
                                                    : showIncorrect
                                                    ? 'border-red-500 bg-red-50'
                                                    : isSelected
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                                        showCorrect
                                                            ? 'border-green-500 bg-green-500'
                                                            : showIncorrect
                                                            ? 'border-red-500 bg-red-500'
                                                            : isSelected
                                                            ? 'border-blue-600 bg-blue-600'
                                                            : 'border-gray-300'
                                                    }`}
                                                >
                                                    {showCorrect || (isSelected && showResult) ? (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent'}`}></div>
                                                    )}
                                                </div>
                                                <span className="text-gray-900 font-medium">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Explanation */}
                        {showResult && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-900">
                                    <strong>Explanation:</strong> {questions[currentQuestion].explanation}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    if (currentQuestion > 0) {
                                        setCurrentQuestion(currentQuestion - 1);
                                        setSelectedAnswer(null);
                                        setShowResult(false);
                                    }
                                }}
                                disabled={currentQuestion === 0}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {!showResult ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                >
                                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="mb-6">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AcademicCapIcon className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                            <div className={`text-2xl font-semibold mb-4 ${getScoreMessage().color}`}>
                                {getScoreMessage().message}
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                                {score} / {questions.length}
                            </div>
                            <div className="text-lg text-gray-600">
                                You scored {getScorePercentage()}%
                            </div>
                        </div>

                        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <h4 className="text-xl font-semibold text-gray-900 mb-4">Keep Learning</h4>
                            <p className="text-gray-600 mb-4">
                                Continue to educate yourself about Diabetrix® and diabetes management. Remember to always consult your healthcare provider with any questions.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleRestartQuiz}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Retake Quiz
                            </button>
                            <Link
                                to="/medication-info"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors inline-block"
                            >
                                Learn More About Diabetrix®
                            </Link>
                            <Link
                                to="/patient-support"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors inline-block"
                            >
                                Patient Support
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;
