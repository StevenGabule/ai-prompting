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
git clone https://github.com/StevenGabule/ai-prompting
cd ai-prompting/backend
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


## Frontend  Setup

### 1. Navigate to the Frontend Directory
From the project root, navigate to the frontend directory:

```bash
cd frontend
```

### 2. Install Frontend Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a .env.local file in the frontend directory and add the following variable:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

### 4. Start the Frontend Server
Run the Next.js development server:
```bash
npm run dev
# or
yarn dev
```
The frontend will be available at http://localhost:3000.

### Running the Project
- **Backend**: Ensure the FastAPI server is running on http://localhost:8001.
- **Frontend**: Ensure the Next.js server is running on http://localhost:3000.
- Open your browser and navigate to http://localhost:3000 to interact with the application.

