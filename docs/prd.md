# **Project Requirements Document**

**Project Name**: JustDoTheThing.ai
**Version**: 0.01

---

## **1. Introduction**

This document defines the requirements for a productivity app designed to assist users in maintaining focus and managing tasks effectively. The app integrates artificial intelligence (AI) to monitor user activity, deliver real-time interventions, and provide personalized productivity insights. It will be accessible via a **Chrome extension** for quick interactions and a **web dashboard** for detailed control and analytics.

---

## **2. Objective**

The app aims to:
- Help users to do the thing (completing tasks they are assigned or want to pursue).

---

## **3. Scope**

The project will be developed in three phases, with features prioritized as follows:
1. **Yell Mode** (Must-Have): AI-powered vocal nudges triggered by activity monitoring to keep users focused.
2. **Yap Mode** (High Priority): Speech-to-text functionality that organizes spoken thoughts into tasks, summaries, and tool suggestions.
3. **Flow Mode** (Medium Priority): Data collection and analysis to provide insights into productivity patterns based on behavior science research.

JustDoTheThing will be available through a dashboard for detailed views and offer quick access through a chrome extension.

---

## **4. Functional Requirements**

### **4.1 Yell Mode (Must-Have Feature)**

- **Description**: Monitors user activity via screenshots and delivers audio "yells" when non-work behavior is detected, helping users stay on task.
- **Features**:
  - **Screenshot Capture**: Take screenshots every 1 minute or when inactivity is detected (e.g., no mouse/keyboard input for a set period).
  - **AI Analysis**: Use a pre-trained image classification model (MobileNet via TensorFlow.js) to classify screenshots as "work" or "non-work" based on open applications or content. If the screenshot is non-work, we will send the first one to GPT-4 with Vision for enhanced contextual analysis.
  - **Audio Messages**: Generate yells using ElevenLabs’ text-to-speech API, offering customizable tones and the option for users to hear their own cloned voice.
  - **Style Customization**: Enable users to choose yelling styles (e.g., "Cheerful Coach," "Drill Sergeant") via the Chrome extension or dashboard, adjustable during use.
  - **Inactivity Detection**: Track mouse and keyboard activity to supplement screenshot analysis and detect idle periods.

### **4.2 Yap Mode (High Priority)**

- **Description**: Allows users to verbalize thoughts, which are transcribed, organized into tasks or summaries, and paired with tool recommendations.
- **Features**:
  - **Speech Input**: Activate speech-to-text with a button in the Chrome extension or dashboard.
  - **Transcription**: Process spoken input into text using OpenAI Whisper API.
  - **Natural Language Processing (NLP)**: Use GPT-4 to:
    - Create prioritized tasks (e.g., "Finish report by 3 PM" tagged as high priority).
    - Generate summaries if no tasks are detected.
    - Categorize ideas (e.g., "New blog post" under "Creative").
  - **Tool Suggestions**: Recommend tools or tech stacks based on input (e.g., for "building a tree detection app," suggest Cursor, Python, and TensorFlow). Update suggestions by scanning Twitter via its API.
  - **Automated Output**: Automatically determine output type (task, summary, or idea) to reduce user effort.

### **4.3 Flow Mode (Medium Priority)**

- **Description**: Tracks user behavior to deliver actionable productivity insights and patterns.
- **Features**:
  - **Data Collection**: Log time spent on tasks, activity levels (did the user make progress from the previous screenshot), and break frequency/duration.
  - **Chronotype Analysis**: Use TensorFlow.js with a time-series model (e.g., LSTM) to identify peak productivity times (e.g., morning person, night owl).
  - **Productivity Insights**:
    - Highlight peak focus periods (e.g., "You’re sharpest from 9-11 AM").
    - Identify distraction patterns (e.g., frequent breaks).
    - Provide weekly trends (e.g., focus hours per day).
  - **Insight Delivery**:
    - Show real-time tips in the Chrome extension (e.g., "Your best focus time is now").
    - Display detailed reports (e.g., graphs) on the web dashboard.

---

## **5. Non-Functional Requirements**

### **5.1 User Interface**

- **Chrome Extension**:
  - Compact design with toggle buttons for Yell, Yap, and Flow Modes.
  - Display brief insights (e.g., "Focused for 20 mins").
  - Include a link to the web dashboard.
- **Web Dashboard**:
  - Grid layout with:
    - **Tasks Card**: View/edit to-do lists.
    - **Mode Controls Card**: Enable/disable modes and adjust settings (e.g., yelling style).
    - **Insights Card**: Visualize productivity data (charts, graphs).
    - **Suggestions Card**: Display AI-driven tool tips.
  - Single-page design for simplicity.

### **5.2 Performance**

- **Screenshot Timing**: Capture every 1 minute or on inactivity to reduce resource usage.
- **Yell Mode Response**: Detect and respond to non-work activity within 10 seconds.
- **Yap Mode Processing**: Transcribe and produce outputs within 5 seconds.

### **5.3 Security and Privacy**

- **Permissions**: Request screen, microphone, and activity access, explained clearly during onboarding.
- **Data Storage**: Encrypt sensitive data in Supabase.
- **User Control**: Allow data deletion or opt-out of tracking features.

### **5.4 Cost Management**

- **Usage Quotas**: Cap OpenAI API calls per user.
- **Subscription Tiers**:
  - **Pro Tier**: Higher limits via a paid subscription.
- **Optimization**: Leverage client-side models TensorFlow.js and cache API results.

---

## **6. Technical Requirements**

### **6.1 Tech Stack**

- **Frontend**: React with Vite for the Chrome extension and web dashboard.
- **Backend**: Node.js for API management and data processing.
- **Database**: Supabase for secure storage of tasks, settings, and data.
- **AI/ML Tools**:
  - **Screenshot Analysis**: TensorFlow.js with MobileNet for work/non-work classification.
  - **Speech-to-Text**: OpenAI Whisper API for Yap Mode.
  - **Text-to-Speech**: ElevenLabs API for Yell Mode audio.
  - **NLP**: GPT-4 for processing Yap Mode input.

### **6.2 Architecture**

- **Chrome Extension**: Captures screenshots, tracks activity, and records speech; sends data to the backend.
- **Backend**: Handles API requests, integrates AI services, and manages Supabase data.
- **Web Dashboard**: Retrieves data from the backend and database for display.

### **6.3 APIs and Integrations**

- **Yell Mode**: TensorFlow.js (screenshot and webcam analysis), ElevenLabs (text-to-speech).
- **Yap Mode**: OpenAI Whisper (speech-to-text), GPT-4 (NLP), Twitter API (tool scanning).
- **Flow Mode**: TensorFlow.js for productivity analysis.

---

## **7. User Flow**

1. **Onboarding**:
   - Install the Chrome extension and grant permissions (screen, microphone).
   - Set preferences (e.g., yelling style).

2. **Mode Activation**:
   - Toggle Yell, Yap, or Flow Modes via the extension; modes can run simultaneously.

3. **Yell Mode**:
   - Captures screenshots periodically or on inactivity.
   - AI detects non-work activity and triggers a customized yell.

4. **Yap Mode**:
   - Record thoughts via a button.
   - Speech is transcribed and converted into tasks or summaries.

5. **Flow Mode**:
   - Collects data during use and offers real-time tips in the extension.
   - Provides detailed insights on the dashboard.

6. **Dashboard Access**:
   - Access via the extension to manage tasks, settings, and insights.

---

## **8. Must-Have Feature: Yell Mode**

- **Why It’s Critical**: Yell Mode is the app’s unique hook, delivering immediate value and engagement through AI-driven vocal nudges.
- **Implementation Steps**:
  1. Set up screenshot capture and inactivity detection.
  2. Implement AI for work/non-work classification.
  3. Integrate text-to-speech for yells.
  4. Add customization options.

---

## **9. Dependencies and Constraints**

- **Independent Modes**: Each mode operates standalone; Flow Mode isn’t required for Yell or Yap.
- **Performance Limits**: Optimize screenshot analysis to avoid device slowdowns.
- **AI Accuracy**: Pre-trained models may need refinement for accurate detection.
- **Resource Costs**: Monitor API usage to manage budget.

---

## **10. Future Considerations**

- **Enhanced Insights**: Add analytics like task success rates.
- **Cross-Platform**: Expand to other browsers or a desktop app.
- **Community Features**: Introduce shared focus sessions or leaderboards.