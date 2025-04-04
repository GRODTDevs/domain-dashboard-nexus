
# Python MongoDB Backend

This is a Python backend for the application, using MongoDB for data storage.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install the requirements:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```
   cp .env.example .env
   ```
   
   Then edit the `.env` file to add your MongoDB connection string.

5. Run the application:
   ```
   python app.py
   ```

The API will be available at http://localhost:3001
