"""
Setup configuration for the Railblocks Error SDK Python package.
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="railblocks_error_sdk",
    version="0.0.2",
    author="Railblocks",
    author_email="team@railblocks.co",
    description="Railblocks AI-powered error reporting SDK with automatic classification and semantic similarity",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/railblocksco/railblocks-error-sdk",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "aiohttp>=3.8.0",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-asyncio>=0.18.0",
            "black>=21.0",
            "isort>=5.0",
            "mypy>=0.900",
        ],
    },
    keywords=[
        "error-reporting",
        "ai-classification", 
        "semantic-similarity",
        "error-tracking",
        "railblocks",
        "sdk"
    ],
    project_urls={
        "Bug Reports": "https://github.com/railblocksco/railblocks-error-sdk/issues",
        "Source": "https://github.com/railblocksco/railblocks-error-sdk",
    },
) 