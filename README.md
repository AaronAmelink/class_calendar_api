# 🛠️ Class Calendar API

This is the **backend RESTful API** for the Learning Planner application. It supports two main features:
- 📒 Notion-style note-taking
- 📚 Class scheduling with prerequisite logic

Built with **Node.js**, **Express**, and **MongoDB**, this API provides endpoints to manage notes, classes, and their dependencies.

## 🚀 Features

### 📝 Notes API
- Create, read, update, and delete notes
- Rich-text content stored as JSON

### 📅 Class Scheduler API
- CRUD operations for classes
- Define prerequisites between classes
- Compute class ordering based on dependencies (topological sort)

## 🛠️ Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for building REST APIs
- **MongoDB** – NoSQL database
