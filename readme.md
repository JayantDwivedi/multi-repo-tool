# 🚀 Multi-Repo Setup Tool (CLI)

[![npm version](https://badge.fury.io/js/multi-repo-setup-tool.svg)](https://www.npmjs.com/package/multi-repo-setup-tool)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A powerful Command Line Interface (CLI) tool designed to automate the initial setup of one or more Git repositories, managing cloning, dependency installation, and project location, all through simple prompts.

## ✨ Features

* **Absolute Path Setup:** Define the exact folder location where your projects will be cloned.
* **Batch Cloning:** Clone multiple repositories at once by providing a semicolon-separated list of URLs.
* **Dependency Management:** Automatically runs `npm install` or `yarn install` (based on user preference) in each newly cloned repository containing a `package.json`.
* **Yarn Check:** Automatically checks if Yarn is installed and attempts to install it globally if needed.

## 🛠️ Prerequisites

Before running the tool, ensure you have the following installed on your system:

1.  **[Node.js](https://nodejs.org/en/download/)** (Version 16 or newer recommended)
2.  **[Git](https://git-scm.com/downloads)** (The `git` command must be available in your system's PATH)

## 📦 Installation

Install the CLI tool globally using npm or yarn, which makes the `repo-setup` command available anywhere on your system.

```bash
# Using npm
npm install -g multi-repo-setup-tool

# Using yarn
yarn global add multi-repo-setup-tool