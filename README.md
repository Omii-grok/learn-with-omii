# Learn With Omii IT - Digital Content Library

Branded classroom Digital Content Library for smart board presentation. Teachers can upload PDFs, PPTs, videos, worksheets, and images, search them, and present them on screen with annotation drawings.

---

## Features
- **Teacher Login**: Only teachers can upload, move, rename, or delete files. Offline mode utilizes preloaded teacher credentials (`teacher@school.com` / `password`).
- **Dynamic Folders**: Create, rename, delete folders, and organize files dynamically.
- **Smart Board Mode**: Increases button sizing, fonts, and interaction hitboxes. Collapses sidebars for larger touch controls.
- **Universal File Player**: Previews images, plays MP4 videos, embeds PDFs, and renders an offline interactive PPT Slide Viewer.
- **Drawing Annotations**: Includes whiteboard pencils, highlighters, laser pointer pulses, and full canvas drawing over presentations.
- **Robust Offline Mode**: Automatically uses a LocalStorage fallback database if Firebase settings are missing.

---

## 1. Local Development Setup

To run the application locally:

1. Navigate to the project root:
   ```bash
   cd digital-classroom-library
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

---

## 2. Firebase Setup & Configuration

To enable cloud storage syncing:

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `learn-with-omii-it`.
3. Disable Google Analytics if not needed, and click **Create Project**.

### Step 2: Set up Authentication
1. Navigate to **Authentication** in the left menu.
2. Click **Get Started**, choose **Email/Password** as the sign-in provider, and enable it.
3. Add a user account under **Users** (e.g. `teacher@school.com` / password `password`).

### Step 3: Set up Cloud Firestore Database
1. Go to **Firestore Database** and click **Create database**.
2. Select your locations and select **Start in production mode** or **test mode**.
3. Apply the following **Firestore Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Folders: Anyone can read, only authenticated teachers can write
       match /folders/{folderId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Files: Anyone can read, only authenticated teachers can write
       match /files/{fileId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Step 4: Set up Firebase Storage
1. Go to **Storage** and click **Get Started**.
2. Apply the following **Storage Security Rules**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /uploads/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Step 5: Configure Environment Variables
Create a file named `.env` in the project root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 3. GitHub Repository Setup

To commit your project to GitHub:

1. Initialize git repository:
   ```bash
   git init
   ```
2. Add all files to staging:
   ```bash
   git add .
   ```
3. Commit the changes:
   ```bash
   git commit -m "feat: initial commit of Learn With Omii IT classroom library"
   ```
4. Create a new repository on GitHub.
5. Link and push to your remote repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/your-username/learn-with-omii-it.git
   git push -u origin main
   ```

---

## 4. Vercel Hosting Deployment

To host your static app on Vercel:

1. Sign in to your [Vercel account](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository `learn-with-omii-it`.
4. Configure the project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add all variables defined in your `.env` file.
6. Click **Deploy**.
