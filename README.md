# Drag and Drop Compiler

## Project Description

The **Drag and Drop Compiler** is a user-friendly web application that allows users to create and build code by simply dragging and dropping building blocks. The compiler processes these blocks and provides the output of the code, making it an ideal tool for beginners and learners to experiment with programming concepts without needing to write code manually.

## Features

### 1. User Account Management

- Users can sign up and create their accounts.
- User authentication and authorization for project access.
- User profiles to manage personal information.

### 2. Project Creation

- Users can create new programming projects.
- Projects are saved and can be edited or deleted.
- Projects can be named and described by users.

### 3. Drag-and-Drop Interface

- A user-friendly, intuitive interface for drag-and-drop programming.
- Building blocks representing programming elements (e.g., variables, loops, conditionals) can be dragged onto a canvas.
- Real-time window that shows the original Python code

### 4. Code Compilation

- Compiling code

### 5. Output Display

- The output of the compiled code is displayed to the user.
- Errors and debugging information are presented for debugging purposes.

## Technologies

- **Frontend**: HTML, CSS, JavaScript.
- **Backend**: Python with a framework - FastAPI.
- **Database**: SQLite for user accounts and project storage.


## Local Run

### - **Frontend**:
- Clone the FE repo.
- Change fetch urls to your desired backend route.
- Start a Live Server and navigate to index.html.

### - **Backend**:
- Clone the BE repo.
- Install the requirements.  
**Assuming you are on a python virtual environment with PIP**
``` bash
pip install -r requirements.txt
```
- Host the backend locally.
``` bash
uvicorn main:app --reload
```
## Hosting
- Hosted on Azure Services using github actions, Azure Web App, Azure registry container, Static Web App, Azure docs explain the deployment process step by step.
- URL for usage: https://gentle-bush-0205a5703.4.azurestaticapps.net

