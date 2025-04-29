# 📇 Exhibition Contact Scanner

## 🌟 Overview
The Exhibition Contact Scanner is a Django-powered web app that transforms images of visiting cards into structured contact data! 📱➡️🗂️ Perfect for exhibitions and networking events, users upload one or more card images, the app sends them to OpenAI's vision API for text extraction, displays the results on screen, and neatly logs everything in a Google Sheet for easy management and follow‑up. ✍️➡️📊

## 🚀 Features
- 📤 **Image Uploads**: Drag-and-drop or browse to upload single/multiple visiting card images.
- 🤖 **AI Analysis**: Leverage OpenAI's advanced vision models to detect names, phone numbers, emails, and company details.
- 👥 **Multiple Contact Detection**: Automatically identify and extract multiple business cards from a single image.
- 📊 **Interactive Results**: View all extracted contacts in a responsive table format with sorting and filtering.
- 📱 **VCF Export**: Download individual or multiple contacts as VCF files for easy import to your mobile device.
- 📝 **Data Storage**: Automatically append extracted contacts to a Google Sheet for real-time tracking.
- ⚙️ **Local & Cloud**: Run locally for development or deploy seamlessly on Vercel.

## 🛠️ Installation
1. **Clone the repo**
2. **Create & activate a Python virtual environment**
3. **Install dependencies**
4. 🔐 **Enable environment variables** (next section)

## 🔐 Environment Variables
- Copy the example
- Open `.env` and fill in all required keys:

## 📜 Obtaining Google Sheets API Credentials
1. Go to the Google Cloud Console: [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select or create a project.
3. Enable the **Google Sheets API** under **APIs & Services → Library**.
4. Navigate to **APIs & Services → Credentials**.
5. Click **Create Credentials → Service account**.
6. Enter a name (e.g., `exhibition-contact-scanner-sa`) and finish the wizard.
7. In the newly created service account, go to **Keys → Add Key → Create new key → JSON**.
8. Download the JSON file and place it in your project (e.g., `credentials/service-account.json`).
9. Set the path in your `.env`:

## 🔗 Granting Access to Your Google Sheet
1. Open your Google Sheet in the browser.
2. Click **Share** in the top-right.
3. In "People and groups", paste your **service-account email** (found in the JSON under `client_email`).
4. Give **Editor** permissions and **Save**.

## 💻 Usage
1. **Start the server**
2. Visit [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.
3. Upload your visiting card images and follow these steps:
   - Select a single card or multiple cards by browsing or dragging files
   - Click **"Scan Card"** to analyze the images
   - View the extracted contacts displayed in a table
   - Select contacts using checkboxes and download as VCF files
   - Browse to the Google Sheet to see all saved contacts


## ☁️ Deployment
To deploy on Vercel:
1. Ensure `vercel.json` is configured with your build settings.
2. Push your code to GitHub (or your preferred Git provider).
3. Import the repo in Vercel and set your environment variables in the Vercel Dashboard.
4. Deploy and share your live URL! 🚀

## 🤝 Contributing
Contributions are welcome! Open an issue or submit a pull request for suggestions, bug fixes, or new features. 🎉

## 📜 License
This project is licensed under the MIT License. ❤️
