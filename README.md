# PrintQueue - Printing Business Web App

A modern web application for managing print jobs with role-based access control, built with Next.js, Firebase, and Tailwind CSS.

## Features

- **Authentication**: Email/password login with admin and user roles
- **Job Management**: Add, view, edit, and complete print jobs
- **Real-time Updates**: Live job status updates using Firestore
- **File Uploads**: Support for job images (JPG, PDF)
- **Filtering & Sorting**: Multiple view modes and filtering options
- **Admin Panel**: Manage users, colors, and printing presses
- **Responsive Design**: Optimized for desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd printing-business-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase config

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. Firebase Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Jobs can be read by authenticated users, written by admins
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null &&
        (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'completedAt']));
    }

    // Colors and presses can be read by authenticated users, written by admins
    match /{collection}/{document} {
      allow read: if request.auth != null && collection in ['colors', 'presses'];
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        collection in ['colors', 'presses'];
    }
  }
}
```

Add these storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /job-images/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

### 6. Deploy to Netlify

1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Add your environment variables in Netlify dashboard
4. Deploy!

### 7. Initial Setup

1. Visit your deployed app URL + `/setup`
2. Create your first admin user
3. Login and start adding users and jobs!

## Usage

### First Time Setup

1. Visit `yourapp.netlify.app/setup`
2. Create your first admin account
3. The setup page will disappear after first use

### Admin Functions

- **Users**: Add/edit/delete users and assign roles
- **Colors**: Manage available print colors
- **Presses**: Manage printing equipment
- **Jobs**: Full CRUD operations on print jobs

### User Functions

- **View Jobs**: See all print jobs with filtering and sorting
- **Complete Jobs**: Mark jobs as completed
- **Real-time Updates**: See job changes instantly

## Project Structure

```
├── components/           # Reusable React components
│   ├── Layout.js        # Main layout wrapper
│   ├── JobComponent.js  # Individual job display
│   ├── Toolbar.js       # Jobs filtering/sorting
│   └── AddJobModal.js   # Job creation modal
├── lib/                 # Utility libraries
│   ├── firebase.js      # Firebase configuration
│   └── auth.js          # Authentication context
├── pages/               # Next.js pages
│   ├── _app.js         # App wrapper
│   ├── index.js        # Home redirect
│   ├── setup.js        # Initial setup page
│   ├── login.js        # Login page
│   ├── jobs.js         # Main jobs page
│   └── admin.js        # Admin panel
└── styles/
    └── globals.css      # Global styles
```

## Database Schema

### Users Collection

- `firstName`: string
- `lastName`: string
- `email`: string
- `role`: 'admin' | 'user'
- `createdAt`: timestamp

### Jobs Collection

- `title`: string (required)
- `quantity`: number (required)
- `hot`: boolean
- `frontColor1`: string (required)
- `frontColor2`: string (optional)
- `backColor1`: string (optional)
- `backColor2`: string (optional)
- `pressId`: string (optional)
- `pressName`: string (optional)
- `imageUrl`: string (optional)
- `status`: 'open' | 'in-progress' | 'completed'
- `createdAt`: timestamp
- `updatedAt`: timestamp

### Colors Collection

- `name`: string
- `hex`: string

### Presses Collection

- `name`: string
- `description`: string

## Support

For issues or questions:

1. Check the Firebase console for errors
2. Verify environment variables are set correctly
3. Ensure Firebase rules are configured properly

## License

MIT License - feel free to use this for your printing business!
