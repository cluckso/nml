package com.me.adhd;

import android.app.Application;
import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

/**
 * Initializes Firebase before Capacitor plugins run.
 * {@code PushNotifications.register()} calls {@code FirebaseMessaging.getInstance()}
 * and crashes the process if the default Firebase app was never created.
 */
public class CallGrabbrApplication extends Application {
    private static final String TAG = "CallGrabbrApplication";

    @Override
    public void onCreate() {
        super.onCreate();
        initializeFirebase();
    }

    private void initializeFirebase() {
        if (!FirebaseApp.getApps(this).isEmpty()) {
            return;
        }

        if (FirebaseApp.initializeApp(this) != null) {
            return;
        }

        String appId = stringResourceOrEmpty("firebase_app_id");
        String apiKey = stringResourceOrEmpty("firebase_api_key");
        String projectId = stringResourceOrEmpty("firebase_project_id");
        String gcmSenderId = stringResourceOrEmpty("firebase_gcm_sender_id");
        String storageBucket = stringResourceOrEmpty("firebase_storage_bucket");

        if (appId.isEmpty() || apiKey.isEmpty() || projectId.isEmpty()) {
            Log.e(TAG, "Firebase is not configured. Add android/app/google-services.json and rebuild.");
            return;
        }

        FirebaseOptions.Builder builder = new FirebaseOptions.Builder()
                .setApplicationId(appId)
                .setApiKey(apiKey)
                .setProjectId(projectId);

        if (!gcmSenderId.isEmpty()) {
            builder.setGcmSenderId(gcmSenderId);
        }
        if (!storageBucket.isEmpty()) {
            builder.setStorageBucket(storageBucket);
        }

        FirebaseApp.initializeApp(this, builder.build());
        Log.i(TAG, "Firebase initialized from google-services.json fallback resources");
    }

    private String stringResourceOrEmpty(String name) {
        int resId = getResources().getIdentifier(name, "string", getPackageName());
        if (resId == 0) {
            return "";
        }
        String value = getString(resId);
        return value == null ? "" : value.trim();
    }
}
