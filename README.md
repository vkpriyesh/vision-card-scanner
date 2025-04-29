```markdown
# 📇 Vision Card Scanner

## 🌟 Overview

The **Vision Card Scanner** is a Django-powered web app that transforms images of visiting cards into structured contact data! 📱➡️🗂️ Users upload one or more card images, the app sends them to OpenAI’s vision API for text extraction, and then it neatly logs everything in a Google Sheet for easy management and follow‑up. ✍️➡️📊

---

## 🚀 Features

- **📤 Image Uploads**: Drag-and-drop or browse to upload single/multiple visiting card images.
- **🤖 AI Analysis**: Leverage OpenAI’s advanced vision models to detect names, phone numbers, emails, and company details.
- **📝 Data Storage**: Automatically append extracted contacts to a Google Sheet for real-time tracking.
- **⚙️ Local & Cloud**: Run locally for development or deploy seamlessly on Vercel.

---

## 🛠️ Installation

1. **Clone the repo**
   ```bash
   git clone <repository-url>
   cd vision-card-scanner
   ```

2. **Create & activate a Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate   # Windows: `venv\\Scripts\\activate`
   ```

3. **Install dependencies**
   ```bash
   pip install -r src/requirements.txt
   ```

4. **🔐 Enable environment variables** (next section)

---

## 🔐 Environment Variables

1. **Copy the example**
   ```bash
   cp .env-example .env
   ```

2. **Open `.env`** and fill in **all** required keys:
   ```dotenv
   API_KEY=                           # 🆔 Your custom API key (if any)
   GOOGLE_SHEET_ID=                   # 📄 ID of your Google Sheet
   GOOGLE_API_KEY=                    # 🔑 Google API key (optional for some setups)
   GOOGLE_APPLICATION_CREDENTIALS=    # 📝 Path to your service-account JSON file
   SECRET_KEY=                        # 🔒 Django secret key
   DEBUG=                             # 🐞 `True` for dev, `False` for prod
   ALLOWED_HOSTS=                     # 🌐 Comma-separated domains (e.g., `localhost,example.com`)
   OPENAI_API_KEY=                    # 🤖 Your OpenAI API key
   ```

---

## 📜 Obtaining Google Sheets API Credentials

1. Go to the **Google Cloud Console**: https://console.cloud.google.com
2. Select or create a **project**.
3. **Enable** the **Google Sheets API** under **APIs & Services → Library**.
4. Navigate to **APIs & Services → Credentials**.
5. Click **Create Credentials → Service account**.
6. Enter a name (e.g., `vision-card-scanner-sa`) and finish the wizard.
7. In the newly created service account, go to **Keys → Add Key → Create new key** → **JSON**.
8. **Download** the JSON file and place it in your project (e.g., `credentials/service-account.json`).
9. Set the path in your `.env`:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=credentials/service-account.json
   ```

---

## 🔗 Granting Access to Your Google Sheet

1. Open your Google Sheet in the browser.
2. Click **Share** in the top-right.
3. In **"People and groups"**, paste your service-account email (found in the JSON under `client_email`).
4. Give **Editor** permissions and **Save**.

---

## 💻 Usage

1. **Start the server**
   ```bash
   python src/manage.py runserver
   ```

2. **Visit** `http://127.0.0.1:8000` in your browser.
3. **Upload** your visiting card images and watch the magic happen! ✨

---

## ☁️ Deployment

To deploy on **Vercel**:
1. Ensure `vercel.json` is configured with your build settings.
2. Push your code to GitHub (or your preferred Git provider).
3. Import the repo in Vercel and set your environment variables in the Vercel Dashboard.
4. Deploy and share your live URL! 🚀

---

## 🤝 Contributing

Contributions are welcome! Open an issue or submit a pull request for suggestions, bug fixes, or new features. 🎉

---

## 📜 License

This project is licensed under the **MIT License**. ❤️
```