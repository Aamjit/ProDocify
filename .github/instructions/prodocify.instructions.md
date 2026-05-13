---
applyTo: "**"
---
# Prodocify App Setup and Structure Guidelines

## Explain the Prodocify App goals and steps

I want to build a Prodocify App that will include the following:

* Online platform for creating, editing, and managing Markdown (MD) files which can be used for documentation, note-taking, and other purposes.
* MD files can be organized into folders and shared with others for collaboration.
* User authentication and profile management
* Dashboard for managing MD files and folders
* MD file creation and editing
* Online MD editor with real-time collaboration
* MD file sharing and collaboration
* Activity logging and tracking
* Version control and history tracking for MD files
* Team creation and management
* Integration with third-party services (e.g., Google Drive, Dropbox)

## Never change directories when agent mode is running commands

- Never change directories
- Instead point to the directory when issuing commands

The section defines the ProDocify App's structure

```text
ProDocify/
├── backend/
└── frontend/
```