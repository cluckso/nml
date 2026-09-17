package com.me.adhd;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.Nullable;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.BillingProgramReportingDetailsParams;
import com.android.billingclient.api.EnableBillingProgramParams;
import com.android.billingclient.api.LaunchExternalLinkParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Play Billing Choice (2026): Stripe checkout stays on the CallGrabbr website.
 * When the user/device is enrolled and eligible, we mint an external transaction
 * token and open the link through {@code launchExternalLink}. Otherwise we fall
 * back to the system browser.
 */
@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin {
    private BillingClient billingClient;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @PluginMethod
    public void getAvailability(PluginCall call) {
        ensureClient(new ClientReady() {
            @Override
            public void onReady(@Nullable BillingClient client, @Nullable String error) {
                JSObject result = new JSObject();
                if (client == null) {
                    result.put("connected", false);
                    result.put("billingChoiceAvailable", false);
                    result.put("externalLinkAvailable", false);
                    result.put("debugMessage", error != null ? error : "Play Billing is unavailable");
                    call.resolve(result);
                    return;
                }
                client.isBillingProgramAvailableAsync(
                    BillingClient.BillingProgram.BILLING_CHOICE,
                    (billingResult, details) -> {
                        boolean ok = billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK;
                        boolean choiceAvailable = false;
                        boolean externalLink = false;
                        String screenType = "";
                        if (ok && details != null && details.getBillingChoiceAvailabilityDetails() != null) {
                            var choice = details.getBillingChoiceAvailabilityDetails();
                            choiceAvailable = true;
                            externalLink = choice.isExternalLinkAvailable();
                            screenType = String.valueOf(choice.getChoiceScreenType());
                        }
                        JSObject payload = new JSObject();
                        payload.put("connected", true);
                        payload.put("billingChoiceAvailable", choiceAvailable);
                        payload.put("externalLinkAvailable", externalLink);
                        payload.put("choiceScreenType", screenType);
                        payload.put("debugMessage", billingResult.getDebugMessage());
                        call.resolve(payload);
                    }
                );
            }
        });
    }

    @PluginMethod
    public void prepareExternalCheckout(PluginCall call) {
        ensureClient(new ClientReady() {
            @Override
            public void onReady(@Nullable BillingClient client, @Nullable String error) {
                JSObject result = new JSObject();
                if (client == null) {
                    result.put("available", false);
                    result.put("externalTransactionToken", "");
                    result.put("debugMessage", error != null ? error : "Play Billing is unavailable");
                    call.resolve(result);
                    return;
                }
                BillingProgramReportingDetailsParams params =
                    BillingProgramReportingDetailsParams.newBuilder()
                        .setBillingProgram(BillingClient.BillingProgram.BILLING_CHOICE)
                        .setDeveloperBillingType(
                            BillingProgramReportingDetailsParams.DeveloperBillingType.EXTERNAL_LINK
                        )
                        .build();
                client.createBillingProgramReportingDetailsAsync(
                    params,
                    (billingResult, reportingDetails) -> {
                        boolean ok = billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK
                            && reportingDetails != null
                            && reportingDetails.getExternalTransactionToken() != null
                            && !reportingDetails.getExternalTransactionToken().isEmpty();
                        JSObject payload = new JSObject();
                        payload.put("available", ok);
                        payload.put(
                            "externalTransactionToken",
                            ok ? reportingDetails.getExternalTransactionToken() : ""
                        );
                        payload.put("debugMessage", billingResult.getDebugMessage());
                        call.resolve(payload);
                    }
                );
            }
        });
    }

    @PluginMethod
    public void launchExternalCheckout(PluginCall call) {
        String url = call.getString("url", "");
        String token = call.getString("externalTransactionToken", "");
        if (url == null || url.isEmpty()) {
            call.reject("Missing checkout URL");
            return;
        }
        Uri uri;
        try {
            uri = Uri.parse(url);
        } catch (Exception e) {
            call.reject("Invalid checkout URL");
            return;
        }

        ensureClient(new ClientReady() {
            @Override
            public void onReady(@Nullable BillingClient client, @Nullable String error) {
                if (client == null || token == null || token.isEmpty()) {
                    openSystemBrowser(uri);
                    JSObject payload = new JSObject();
                    payload.put("launched", true);
                    payload.put("usedPlayApi", false);
                    call.resolve(payload);
                    return;
                }

                Activity activity = getActivity();
                if (activity == null) {
                    openSystemBrowser(uri);
                    JSObject payload = new JSObject();
                    payload.put("launched", true);
                    payload.put("usedPlayApi", false);
                    call.resolve(payload);
                    return;
                }

                LaunchExternalLinkParams params = LaunchExternalLinkParams.newBuilder()
                    .setBillingProgram(BillingClient.BillingProgram.BILLING_CHOICE)
                    .setLinkUri(uri)
                    .setLinkType(LaunchExternalLinkParams.LinkType.LINK_TO_DIGITAL_CONTENT_OFFER)
                    .setLaunchMode(LaunchExternalLinkParams.LaunchMode.LAUNCH_IN_EXTERNAL_BROWSER_OR_APP)
                    .setExternalTransactionToken(token)
                    .build();

                mainHandler.post(() -> client.launchExternalLink(
                    activity,
                    params,
                    billingResult -> {
                        boolean ok = billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK;
                        if (!ok) {
                            openSystemBrowser(uri);
                        }
                        JSObject payload = new JSObject();
                        payload.put("launched", true);
                        payload.put("usedPlayApi", ok);
                        payload.put("debugMessage", billingResult.getDebugMessage());
                        call.resolve(payload);
                    }
                ));
            }
        });
    }

    private void openSystemBrowser(Uri uri) {
        Activity activity = getActivity();
        if (activity == null) return;
        mainHandler.post(() -> {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
        });
    }

    private synchronized void ensureClient(ClientReady ready) {
        if (billingClient != null && billingClient.isReady()) {
            ready.onReady(billingClient, null);
            return;
        }
        Activity activity = getActivity();
        if (activity == null) {
            ready.onReady(null, "No activity");
            return;
        }
        try {
            EnableBillingProgramParams programParams = EnableBillingProgramParams.newBuilder()
                .setBillingProgram(BillingClient.BillingProgram.BILLING_CHOICE)
                .build();
            billingClient = BillingClient.newBuilder(activity)
                .setListener((billingResult, purchases) -> { })
                .enablePendingPurchases(
                    PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
                )
                .enableBillingProgram(programParams)
                .build();
        } catch (Throwable t) {
            ready.onReady(null, t.getMessage());
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    ready.onReady(billingClient, null);
                } else {
                    ready.onReady(null, billingResult.getDebugMessage());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Next call will reconnect.
            }
        });
    }

    private interface ClientReady {
        void onReady(@Nullable BillingClient client, @Nullable String error);
    }
}
