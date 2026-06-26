import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

bearer_scheme = HTTPBearer()

async def get_clerk_public_keys():
    url = f"{settings.CLERK_JWT_ISSUER}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()

async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> dict:
    token = credentials.credentials
    try:
        jwks = await get_clerk_public_keys()
        # Decode header to get kid
        header = jwt.get_unverified_header(token)
        # Find matching key
        key = next(
            (k for k in jwks["keys"] if k["kid"] == header.get("kid")), None
        )
        if not key:
            raise HTTPException(status_code=401, detail="Public key not found")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")