# EventSnap Organizer 📸

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

EventSnap Organizer is a powerful web application designed to revolutionize event photo management. It combines facial recognition technology with secure sharing capabilities to create an intuitive platform for organizing and sharing event memories.

## 🌟 Key Features

- **Smart Photo Organization**: Automatically organize photos by events and people
- **Facial Recognition**: AI-powered face detection and tagging
- **Secure Sharing**: Share albums with specific people or groups
- **PDF Generation**: Create beautiful event highlight PDFs
- **Real-time Collaboration**: Multiple users can contribute to the same event
- **Cloud Storage**: Secure cloud storage with Cloudinary integration
- **Authentication**: Secure user authentication with Firebase

## 🛠️ Technology Stack

### Frontend
- React.js 18.2.0
- Material-UI & Bootstrap
- Firebase Authentication
- face-api.js for facial recognition
- jsPDF for PDF generation
- Cloudinary for image management

### Backend
- Node.js with Express
- MongoDB for event data
- Firebase Admin SDK
- Cloudinary API
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Firebase account
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yusuf-ravat/Event-Snap-Organizer.git
cd Event-Snap-Organizer
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Environment Setup:
   - Copy `.env.example` to `.env` in both root and backend directories
   - Update the environment variables with your credentials

4. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📱 Features in Detail

### Event Management
- Create and manage multiple events
- Upload photos in bulk
- Organize photos by categories
- Add event details and descriptions

### Photo Organization
- Automatic facial recognition
- Manual tagging options
- Album creation and management
- Photo filtering and search

### Sharing Capabilities
- Generate shareable links
- Set access permissions
- Real-time updates
- Download options

### Security Features
- Firebase Authentication
- Secure file storage
- Role-based access control
- Data encryption

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Yusuf Ravat** - *Initial work* - [GitHub Profile](https://github.com/yusuf-ravat)

## 🙏 Acknowledgments

- Firebase for authentication and storage
- Cloudinary for image management
- face-api.js for facial recognition
- MongoDB for database management

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

⭐ Star this repository if you find it useful!
