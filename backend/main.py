import os
from typing import List, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(title="STUDS-HELP AI")


# =========================================================
# CORS CONFIGURATION
# =========================================================

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST / RESPONSE MODELS
# =========================================================

class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=4000
    )
    history: List[HistoryItem] = []


class ChatResponse(BaseModel):
    response: str


# =========================================================
# AI SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are STUDS-HELP AI, a friendly academic assistant for students.

Your main purpose is to help students understand academic topics
in simple, clear and easy language.

Rules:

- Explain concepts in simple words.
- Give examples when useful.
- Give step-by-step explanations for difficult questions.
- Help with programming, mathematics, computer science and academic subjects.
- Help students understand assignments and homework.
- Help students prepare for exams and viva questions.
- Use headings and bullet points when useful.
- For programming questions, provide simple and understandable code.
- Explain code when necessary.
- Avoid unnecessarily complicated or high-level language.
- If the question is unclear, ask the student to clarify.
- Do not make up information.
- Be polite, friendly and helpful.
"""


# =========================================================
# FREE MODEL FALLBACK LIST
# =========================================================
#
# The first model is the fastest working model for your
# current setup.
#
# If it fails, the next model is automatically tried.
#
# We do NOT use "openrouter/free" because we want control
# over which models are used.
#

FREE_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-ultra:free",
]


# =========================================================
# CREATE OPENROUTER CLIENT
# =========================================================

def get_openrouter_client():

    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not configured in the .env file."
        )

    return OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1"
    )


# =========================================================
# BUILD CHAT MESSAGES
# =========================================================

def build_messages(
    message: str,
    history: List[HistoryItem]
):

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # Keep only the latest 20 messages
    for item in history[-20:]:

        messages.append(
            {
                "role": item.role,
                "content": item.content
            }
        )

    # Add current user message
    messages.append(
        {
            "role": "user",
            "content": message
        }
    )

    return messages


# =========================================================
# ASK AI
# =========================================================

def ask_ai(
    message: str,
    history: List[HistoryItem]
) -> str:

    client = get_openrouter_client()

    messages = build_messages(
        message,
        history
    )

    errors = []

    # Try models one by one
    for model in FREE_MODELS:

        print(
            f"Trying OpenRouter model: {model}"
        )

        try:

            response = client.chat.completions.create(
                model=model,
                messages=messages
            )

            answer = response.choices[0].message.content

            if not answer:
                raise ValueError(
                    "The model returned an empty response."
                )

            print(
                f"Successfully received response from: {model}"
            )

            return answer

        except Exception as e:

            error_message = str(e)

            print(
                f"Model failed: {model}"
            )

            print(
                f"Error: {error_message}"
            )

            errors.append(
                f"{model}: {error_message}"
            )

            # -------------------------------------------------
            # If model is rate-limited, immediately try next
            # model without waiting.
            # -------------------------------------------------

            if "429" in error_message:

                print(
                    "Rate limit detected. "
                    "Trying the next model..."
                )

                continue

            # -------------------------------------------------
            # For other errors, also try the next model.
            # -------------------------------------------------

            continue

    # =====================================================
    # ALL MODELS FAILED
    # =====================================================

    print(
        "All OpenRouter models failed."
    )

    for error in errors:
        print(error)

    raise RuntimeError(
        "All available AI models are temporarily unavailable."
    )


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():

    return {
        "status": "STUDS-HELP AI backend is running"
    }


# =========================================================
# CHAT ENDPOINT
# =========================================================

@app.post(
    "/api/chat",
    response_model=ChatResponse
)
def chat(req: ChatRequest):

    try:

        answer = ask_ai(
            req.message,
            req.history
        )

        return ChatResponse(
            response=answer
        )

    except ValueError as e:

        print(
            f"Configuration error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="AI service is not configured correctly."
        )

    except RuntimeError as e:

        print(
            f"AI service error: {e}"
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "AI service is temporarily unavailable. "
                "Please try again in a few moments."
            )
        )

    except Exception as e:

        print(
            f"Unexpected OpenRouter error: {e}"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Something went wrong while generating "
                "the AI response."
            )
        )