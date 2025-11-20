# Mobile App Setup Guide

This guide provides step-by-step instructions to set up and run the Mushroom Monitoring System mobile application.

## Prerequisites

- **Node.js**: Ensure Node.js (LTS version recommended) is installed.
- **npm**: Comes with Node.js.
- **Expo Go App**: Install the Expo Go app on your physical Android or iOS device if you want to test on a real device.

## Installation

1. **Navigate to the mobile app directory:**

    ```bash
    cd mobile-app
    ```

2. **Install dependencies:**

    Because of potential peer dependency conflicts with some React Native packages, it is recommended to use the `--legacy-peer-deps` flag.

    ```bash
    npm install --legacy-peer-deps
    ```

## Running the App

1. **Start the Expo development server:**

    ```bash
    npx expo start --clear
    ```

    *The `--clear` flag is optional but recommended to clear the Metro bundler cache.*

2. **Open the App:**

    - **On Android Emulator**: Press `a` in the terminal.
    - **On iOS Simulator**: Press `i` in the terminal (macOS only).
    - **On Physical Device**:
        - Open the **Expo Go** app on your phone.
        - Scan the QR code displayed in the terminal.

## Troubleshooting

- **Dependency Conflicts**: If you encounter `ERESOLVE` errors during installation, ensure you are using `npm install --legacy-peer-deps`.
- **Icon Issues**: If icons are missing, try stopping the server and running `npx expo start --clear`.
- **TypeScript Errors**: You can verify the code integrity by running `npx tsc --noEmit`.

## Features & Usage

- **Dashboard**: Main view with sensor data, charts, and video feed.
- **Language Switcher**: Toggle between English, Sinhala, and Tamil using the button in the top right.
- **Sensor Controls**: Manually read sensors or enter calibration mode.
- **Robot Arm**: Control the robot arm position and view its status.
- **ML Model**: Monitor light control, predictions, and model health.
