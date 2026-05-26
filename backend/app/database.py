"""
Database configuration and session management
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, urlunparse

load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/serene_mind_db")

# For async support, convert postgresql:// to postgresql+asyncpg://
# Also handle SSL parameters for asyncpg
def get_async_database_url(url: str) -> str:
    """Convert sync PostgreSQL URL to async asyncpg URL with proper SSL handling"""
    parsed = urlparse(url)
    
    # Replace the scheme
    scheme = parsed.scheme.replace("postgresql", "postgresql+asyncpg")
    
    # Parse query parameters
    query_params = parse_qs(parsed.query) if parsed.query else {}
    
    # Convert sslmode to ssl for asyncpg
    ssl_value = None
    if "sslmode" in query_params:
        sslmode = query_params.pop("sslmode")[0]
        if sslmode == "require":
            ssl_value = "True"
    
    # Rebuild URL without query string first
    url_without_query = urlunparse((
        scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        "",
        ""
    ))
    
    # Build new query string
    new_params = {k: v[0] for k, v in query_params.items() if k != "sslmode" and k != "channel_binding"}
    query_str = "&".join(f"{k}={v}" for k, v in new_params.items()) if new_params else ""
    
    return url_without_query + (f"?{query_str}" if query_str else "")

ASYNC_DATABASE_URL = get_async_database_url(DATABASE_URL)

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=os.getenv("DEBUG", False),
    poolclass=NullPool,
    future=True
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for models
Base = declarative_base()

# Database initialization
async def init_db():
    """Initialize database tables"""
    import asyncio
    try:
        print(f"DEBUG: Attempting to connect to database...")
        # Set a timeout for the connection
        await asyncio.wait_for(
            engine.connect(),
            timeout=5.0
        )
        print("DEBUG: Database connection successful, dropping old tables...")
        async with engine.begin() as conn:
            # Drop all tables first to ensure fresh schema
            await conn.run_sync(Base.metadata.drop_all)
        print("DEBUG: Creating tables with updated schema...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("DEBUG: Database tables initialized successfully")
    except asyncio.TimeoutError:
        print("WARNING: Database connection timed out. Continuing without initialization.")
    except Exception as e:
        print(f"WARNING: Database initialization failed: {type(e).__name__}")
        print("Server will continue, but database operations may fail until database is accessible.")

# Session dependency
async def get_db():
    """Get database session"""
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
