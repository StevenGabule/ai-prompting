# AI Prompting

This project consists of a backend built with **FastAPI**, **Redis**, **OpenAI**, and **Langchain**, and a frontend built with **Next.js v14**, **Axios**, and the **App Router**. Below are the instructions to set up and run the project locally.

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Redis**
- **pip** (Python package manager)
- **npm** or **yarn** (Node.js package manager)
- **OpenAI API Key** (You can get this from [OpenAI](https://platform.openai.com/))

---

## Backend Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Set Up a Virtual Environment (Optional but Recommended)

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### 3. Install Backend Dependencies
Navigate to the backend directory and install the required Python packages:
```bash
cd backend
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a .env file in the backend directory and add the following variables:
```bash
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=redis://localhost:6379
```
Replace your_openai_api_key with your actual OpenAI API key.

### 5. Run Redis
Ensure Redis is running locally. You can start it using:
```bash
redis-server
```

### 6. Start the Backend Server
Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8001
```
The backend will be available at http://localhost:8001.