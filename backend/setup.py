from setuptools import setup, find_packages

setup(
    name="ai prompting",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "requests>=2.25.1",
        "pandas>=1.2.0",
    ],
    author="John Paul Gabule",
    author_email="lucas.gabule@gmail.com",
    description="AI prompting application",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/StevenGabule/ai-prompting",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
)
