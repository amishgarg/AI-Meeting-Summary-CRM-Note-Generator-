# AI Meeting Summary + CRM Note Generator

This is a full-stack web application designed to help sales and operations teams by automatically summarizing client meeting transcripts. Users can upload a text file of a meeting, and the application uses Google's Gemini AI to extract a concise summary, client objections, and actionable next steps. It also includes a feature to email the formatted summary.

## Features

-   **Upload Transcripts**: Supports uploading meeting transcripts in `.txt` format.
-   **AI-Powered Analysis**: Leverages the Google Gemini API to intelligently analyze the text.
-   **Key Insight Extraction**:
    -   Generates a concise **summary** of the meeting.
    -   Identifies client **objections and pain points**, along with their resolutions.
    -   Extracts a clear list of **action items** and follow-ups.
-   **Dashboard Display**: Neatly displays all generated information on a clean user interface.
-   **Email Functionality**: Allows the user to email the formatted summary to a predefined address.

---

## Tech Stack

-   **Frontend**: React.js (Vite) with Tailwind CSS
-   **Backend**: Python with FastAPI
-   **AI**: Google Gemini
-   **Email**: Python's built-in `smtplib`

---

## Setup and Installation

### Prerequisites

-   Python 3.8+
-   Node.js and npm
-   A Google AI API Key
-   A Gmail account with 2-Step Verification enabled

### Backend Setup

1.  **Navigate to the backend folder**:
    ```cmd
    cd backend
    ```
2.  **Create and activate a virtual environment**:
    ```cmd
    python -m venv venv
    venv\Scripts\activate.bat
    ```
3.  **Install Python dependencies**:
    ```cmd
    pip install -r requirements.txt
    ```
4.  **Create and configure the environment file**:
    -   Create a `.env` file in the `backend` folder.
    -   Fill in the required values as described in the **Configuration** section below.

### Frontend Setup

1.  **Navigate to the frontend folder**:
    ```cmd
    cd frontend
    ```
2.  **Install Node.js dependencies**:
    ```cmd
    npm install
    ```

---

## Configuration

You must create a `.env` file inside the `backend` folder with the following variables:

```
# --- Google AI API Key ---
GOOGLE_API_KEY="your-google-api-key-here"

# --- Email Credentials ---
SENDER_EMAIL="your-email@gmail.com"
SENDER_APP_PASSWORD="your-16-character-app-password"
RECEIVER_EMAIL="email-to-send-summary-to@example.com"
```

**Variable Explanations:**

-   **`GOOGLE_API_KEY`**: Your API key from Google AI Studio.
-   **`SENDER_EMAIL`**: The Gmail address the summary will be sent from.
-   **`SENDER_APP_PASSWORD`**: **This is NOT your regular Gmail password.** It is a 16-character password you must generate from your Google Account settings. To get one, you must have 2-Step Verification enabled. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) to create it.
-   **`RECEIVER_EMAIL`**: The email address that will receive the summary.

---

## Running the Application

You must run the backend and frontend servers in two separate terminals.

### 1. Start the Backend

-   Navigate to the `backend` folder and activate the virtual environment.
-   Run the following command:
    ```cmd
    uvicorn main:app --reload
    ```
-   The backend will be running on `http://127.0.0.1:8000`.

### 2. Start the Frontend

-   Open a **new terminal** and navigate to the `frontend` folder.
-   Run the following command:
    ```cmd
    npm run dev
    ```
-   The application will open in your browser, usually at `http://localhost:5173`.