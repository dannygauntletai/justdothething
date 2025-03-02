# Firebase Integration & Migration Strategy

## Overview
This document outlines our strategy for migrating from Supabase/Prisma to Firebase for both authentication and data storage. The transition is motivated by the need for a more scalable and flexible solution to support the Yap Mode and Flow Mode features, while addressing Row-Level Security (RLS) issues encountered with Supabase.

## Migration Goals
1. Migrate from Supabase Auth to Firebase Auth
2. Move all data storage from Supabase PostgreSQL to Firebase Firestore
3. Implement client-side processing for most AI features with minimal backend requirements
4. Implement Firebase Functions for generating summaries and other intensive operations
5. Ensure a seamless transition for existing users (though minimal user data currently exists)

## Architecture Changes

### Authentication Flow
- **Previous**: Supabase Auth with JWT tokens
- **New**: Firebase Auth with Firebase SDK for authentication
- **Changes**: 
  - Replace Supabase Auth with Firebase Auth in the frontend
  - Update authentication middleware to verify Firebase JWT tokens
  - Update user management to use Firebase Authentication

### Data Storage
- **Previous**: Supabase PostgreSQL with Prisma ORM
- **New**: Firebase Firestore for document storage
- **Changes**:
  - Create Firestore collections for users, screenshots, transcriptions, tasks, summaries, and insights
  - Implement Firestore security rules to control access
  - Update frontend services to interact with Firestore instead of PostgreSQL

## Processing Model
- **Client-side Processing**:
  - Speech recognition and transcription (Web Speech API)
  - Task extraction from transcriptions (NLP in browser)
  - Work classification for Yell Mode (TensorFlow.js)
  - Screenshot capture and analysis (html2canvas + TensorFlow.js)
  
- **Backend Processing** (Firebase Functions):
  - Generate summaries from transcriptions
  - Aggregate insights for Flow Mode (optional)

## Migration Steps

### 1. Firebase Project Setup
- Create a new Firebase project
- Enable Firebase Authentication
- Create Firestore database and define initial collections
- Set up Firebase Storage for media files (if needed)
- Generate and secure Firebase configuration files

### 2. Authentication Integration
- Install Firebase Auth SDK in the frontend
- Implement Firebase Auth components in the frontend
- Create authentication context using Firebase Auth
- Update authentication middleware in backend to validate Firebase tokens
- Create user synchronization logic if necessary for existing users

### 3. Yell Mode Migration
- Update Yell Mode to store metadata in Firestore
- Keep local TensorFlow.js processing for work classification
- Update frontend to use Firebase SDK for data storage

### 4. Yap Mode Implementation
- Implement speech recognition using Web Speech API
- Create local processing for transcription analysis
- Store processed data in Firestore
- Implement Firebase Functions for generating summaries

### 5. Flow Mode Implementation
- Implement local data processing with TensorFlow.js
- Store insights and metrics in Firestore
- Create visualization components that read from Firestore

### 6. Data Migration (if needed)
- Create migration script to transfer user data
- Validate data integrity after migration
- Update all backend endpoints to use Firebase Admin SDK

## Security Considerations
- **Firebase Security Rules**: Implement proper security rules in Firestore to control data access
- **User ID Synchronization**: Ensure user IDs are properly synchronized between authentication and data storage
- **Client-Side Security**: Implement proper validation on client-side before sending data to Firestore

## Performance Considerations
- **Firestore Optimization**: Structure collections and documents to optimize for common queries
- **Offline Capabilities**: Leverage Firestore's offline capabilities for better user experience
- **Client-Side Processing**: Optimize local processing to minimize browser resource usage

## Testing Strategy
- **Unit Testing**: Test individual components with Firebase emulators
- **Integration Testing**: Test the complete flow from authentication to data storage
- **Security Testing**: Verify security rules by testing access patterns
- **Performance Testing**: Ensure client-side processing works well across different devices

## Rollout Plan
1. **Development Phase**:
   - Implement Firebase Auth
   - Update frontend services to use Firestore
   - Develop and test Yap Mode with Firebase integration

2. **Testing Phase**:
   - Test authentication flow
   - Verify data storage and retrieval
   - Validate security rules

3. **Implementation Phase**:
   - Roll out authentication changes
   - Deploy updated services
   - Monitor for any issues

## Conclusion
Migrating to Firebase for both authentication and data storage provides a more flexible and scalable solution for our application. The use of client-side processing for most features reduces backend complexity and costs, while still providing a powerful user experience. Firebase Functions can be used selectively for operations that require additional computing power, such as generating summaries from transcriptions. 