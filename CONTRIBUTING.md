
# Contributing to holo-fn

Thank you for your interest in contributing to **holo-fn**! To keep things organized and make it easier for you to get involved, please read through the guidelines below.

---

## 🚀 Setup

### 1. Install Dependencies

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/holo-fn.git
cd holo-fn
bun install
```

### 2. Running Tests and Coverage

You can run the tests using Jest to ensure everything works as expected:

```bash
bun run test
```

To convert the coverage into an HTML report, run:

```bash
bun run coverage:html
```

---

## 📦 Building

To build the project:

```bash
bun run build
```

---

## 🧰 Testing Locally

To test your changes locally before publishing or linking the library:

1. Build the Library:

  - Run the following to build the project and prepare the files for testing:
  ```bash
  bun run build
  ```

2. Pack the Library:

  - After building, run npm pack to create a .tgz file that you can install locally:
  ```bash
  bun pm pack
  ```

3. Install Locally in Your Test Project:

  - In the project where you want to test the library, run the following:
  ```bash
  npm install /path/to/holo-fn-<version>.tgz
  ```

  - This will install the library locally in your project, and you can import and use it as if it were an npm package.

---

## 🤝 How to Contribute

1. **Fork the repository** to your GitHub account and clone it locally.
2. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feat/issue-number-or-short-description
   ```
3. **Make your changes**: add your feature or fix the bug.
4. **Commit your changes**:
   ```bash
   git commit -am 'feat: add new feature'  # or 'fix: resolve issue'
   ```
5. **Push to your fork**:
   ```bash
   git push origin feat/issue-number-or-short-description
   ```
6. **Create a pull request** from your fork to the main repository.

---

## 🎯 Guidelines

- Please **write clear commit messages**.
- Ensure all code is **properly tested**.
- Follow the **code style** used in the project.

Thank you for contributing! 🚀
