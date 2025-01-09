from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
import redis
from datetime import timedelta
import json
import hashlib
import socket

app = FastAPI(title="Ai Prompt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your Next.js frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


def check_port_available(port: int) -> bool:
    """Check if a port is available."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("", port))
            return True
        except socket.error:
            return False


def find_available_port(start_port: int = 8000, max_attempts: int = 100) -> int:
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        if check_port_available(port):
            return port
    raise RuntimeError(
        f"No available ports found between {start_port} and {start_port + max_attempts}"
    )


# Redis connection with error handling
def get_redis_client():
    try:
        client = redis.Redis(
            host="172.19.80.1",  # WSL IP address
            port=6379,
            db=0,
            decode_responses=True,
            socket_timeout=5,  # Add timeout
            retry_on_timeout=True,  # Enable retries
        )
        # Test the connection
        client.ping()  # type: ignore
        print("Successfully connected to Redis")
        return client
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        print("Make sure Redis is running in WSL and the IP address is correct")
        return None
    except Exception as e:
        print(f"Unexpected error connecting to Redis: {e}")
        return None


redis_client = redis_client = get_redis_client()


class Query(BaseModel):
    text: str
    task_type: Optional[str] = "general"  # general, analysis, creative, or technical
    context: Optional[str] = None
    model_provider: Optional[str] = "openai"
    temperature: Optional[float] = 0.7


class Response(BaseModel):
    generated_text: str
    cache_hit: bool = False


class CacheConfig:
    EXPIRATION_HOURS = 24


def generate_cache_key(query: Query) -> str:
    """Generate a unique cache key for a query"""
    # Create a dictionary of the query parameters that affect the response
    cache_dict = {  # type: ignore
        "text": query.text,
        "task_type": query.task_type,
        "context": query.context,
        "model_provider": query.model_provider,
        "temperature": query.temperature,
    }
    # Convert to a stable string representation and hash it
    cache_str = json.dumps(cache_dict, sort_keys=True)
    return hashlib.md5(cache_str.encode()).hexdigest()


def get_from_cache(cache_key: str) -> Optional[str]:
    """Try to get a response from cache"""
    try:
        cached_response = redis_client.get(cache_key)  # type: ignore
        return cached_response  # type: ignore
    except redis.RedisError as e:
        print(f"Redis error: {e}")
        return None


def save_to_cache(cache_key: str, response: str):
    """Save a response to cache with expiration"""
    try:
        redis_client.setex(  # type: ignore
            cache_key, timedelta(hours=CacheConfig.EXPIRATION_HOURS), response
        )
    except redis.RedisError as e:
        print(f"Redis error: {e}")


SYSTEM_MESSAGES = {
    "general": """You are a helpful AI assistant. Provide clear, accurate, and helpful responses.""",
    "analysis": """You are an analytical AI assistant. Break down problems step by step, 
    consider multiple perspectives, and provide thorough analysis with clear reasoning.""",
    "creative": """You are a creative AI assistant. Think outside the box, generate unique ideas, 
    and provide imaginative solutions while maintaining relevance to the topic.""",
    "technical": """You are a technical AI assistant. Provide precise, detailed technical explanations, 
    include relevant code examples when appropriate, and focus on best practices.""",
}


def get_prompt_template(task_type: str, context: Optional[str] = None):
    system_message = SYSTEM_MESSAGES.get(task_type, SYSTEM_MESSAGES["general"])

    if context:
        template = f"""System: {system_message}

Context Information:
{context}

User Query: {{query}}

Please provide a response that takes into account both the context provided and the user's query.
"""
    else:
        template = f"""System: {system_message}

User Query: {{query}}

Please provide a response based on the user's query.
"""

    return PromptTemplate(input_variables=["query"], template=template)


def get_llm(temperature: Optional[float] = None):
    if temperature is None:
        temperature = 0.7

    return OpenAI(temperature=temperature)


@app.post("/ai", response_model=Response)
async def generate_response(query: Query):
    try:
        cache_key = generate_cache_key(query)

        cached_response = get_from_cache(cache_key)
        if cached_response:
            return Response(generated_text=cached_response, cache_hit=True)

        # Initialize the language model
        llm = get_llm(query.temperature)
        prompt_template = get_prompt_template(query.task_type, query.context)  # type: ignore
        chain = prompt_template | llm | RunnablePassthrough()  # type: ignore
        response = chain.invoke({"query": query.text})  # type: ignore

        # Save to cache
        save_to_cache(cache_key, response)  # type: ignore

        return Response(generated_text=response, cache_hit=False)  # type: ignore

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    try:
        port = find_available_port()
        print(f"Starting server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port)
    except Exception as e:
        print(f"Failed to start server: {e}")
