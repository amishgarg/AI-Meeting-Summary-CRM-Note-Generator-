import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnalysis(null);
    setError('');
    setEmailStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);
    setError('');
    setEmailStatus('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/process/transcript`, formData);
      setAnalysis(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendEmail = async () => {
    if (!analysis) return;
    setIsSendingEmail(true);
    setEmailStatus('');
    try {
      await axios.post(`${API_BASE_URL}/api/v1/email/summary`, analysis);
      setEmailStatus('Email sent successfully!');
    } catch (err) {
      setEmailStatus(err.response?.data?.detail || 'Failed to send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">[AI] Meeting Summarizer</h1>
          <p className="text-md text-gray-600 mt-2">Upload a meeting transcript (.txt) to get instant insights.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={isLoading || !file}
              className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Meeting'}
            </button>
          </form>
        </div>

        {isLoading && <div className="text-center">Processing, please wait...</div>}
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        {analysis && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isSendingEmail ? 'Sending...' : 'Email Summary'}
              </button>
              {emailStatus && <p className="text-sm mt-2">{emailStatus}</p>}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Meeting Summary</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{analysis.summary}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Objections & Pain Points</h2>
              {analysis.objections && analysis.objections.length > 0 ? (
                <ul className="space-y-4">
                  {analysis.objections.map((obj, index) => (
                    <li key={index} className="p-3 bg-yellow-50 rounded-md">
                      <p><strong>Objection:</strong> {obj.point}</p>
                      <p><strong>Resolution:</strong> {obj.resolution || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No specific objections were identified.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Action Items & Next Steps</h2>
              {analysis.action_items && analysis.action_items.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {analysis.action_items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No specific action items were identified.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}