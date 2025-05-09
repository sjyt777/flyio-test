from logging.config import fileConfig
import os
from alembic import context
from sqlalchemy import engine_from_config, pool, create_engine
from sqlalchemy.engine import Connection
from dotenv import load_dotenv

# model の MetaData
from app.core.database import Base
from app.models import User, Event, EventParticipant  # noqa

load_dotenv()
config = context.config
if os.getenv("DATABASE_URL"):
    config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# logging
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    # ① create_engine で同期エンジン
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:  # ←同期
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
