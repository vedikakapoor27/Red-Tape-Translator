import json
import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are Red Tape Translator, an expert assistant that helps Indian citizens find government schemes they qualify for.

When a user describes their situation, you must:
1. Identify ALL government schemes they may qualify for from the provided schemes database
2. Explain WHY they qualify for each scheme
3. Draft a formal application letter in English for the most relevant scheme

Always respond in this EXACT JSON format:
{
  "summary": "Brief empathetic acknowledgment of the user's situation",
  "matched_schemes": [
    {
      "scheme_id": "the scheme's database ID",
      "scheme_name": "Name of the scheme",
      "confidence_score": 0.95,
      "reason": "Specific reason this person qualifies"
    }
  ],
  "draft_letter": "Full formal letter text here for the highest-confidence scheme",
  "follow_up_question": "One clarifying question to find more schemes (optional)"
}

Be compassionate. These are real people navigating complex bureaucracy. Confidence scores should be between 0.0 and 1.0."""

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_claude(messages: list[dict], schemes_context: str) -> dict:
    """Call Claude API with conversation history and schemes context."""
    system = f"{SYSTEM_PROMPT}\n\n=== AVAILABLE SCHEMES DATABASE ===\n{schemes_context}"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=system,
        messages=messages,
    )

    raw = response.content[0].text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)

def build_schemes_context(schemes: list) -> str:
    """Format schemes as a readable context block for Claude."""
    lines = []
    for s in schemes:
        lines.append(f"""
ID: {s.id}
Name: {s.name}
Ministry: {s.ministry}
Category: {s.category}
Description: {s.description}
Eligibility: {s.eligibility}
Benefits: {s.benefits}
Documents Required: {', '.join(s.documents_required or [])}
---""")
    return "\n".join(lines)

def format_messages_for_claude(messages: list) -> list[dict]:
    """Convert DB message objects to Claude API format."""
    return [{"role": m.role, "content": m.content} for m in messages]