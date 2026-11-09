package dev.p1aulie.klar;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final String LOCAL_HOST = "appassets.androidplatform.net";
    private static final int REQUEST_IMPORT = 201;
    private static final int REQUEST_EXPORT = 202;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingBackup;

    @Override
    @SuppressWarnings("SetJavaScriptEnabled")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(11, 16, 15));
        getWindow().setNavigationBarColor(Color.rgb(11, 16, 15));
        getWindow().getDecorView().setSystemUiVisibility(0);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(11, 16, 15));
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebContentsDebuggingEnabled(false);
        webView.addJavascriptInterface(new BackupBridge(), "KlarNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !LOCAL_HOST.equals(uri.getHost())) return null;
                String path = uri.getPath();
                String asset = "/assets/".equals(path) || "/".equals(path) ? "index.html" :
                    (path != null && path.startsWith("/assets/") ? path.substring("/assets/".length()) : "");
                if (!asset.matches("[a-zA-Z0-9._-]+")) return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new java.io.ByteArrayInputStream(new byte[0]));
                String mime = asset.endsWith(".html") ? "text/html" :
                    asset.endsWith(".css") ? "text/css" :
                    asset.endsWith(".js") ? "text/javascript" :
                    asset.endsWith(".png") ? "image/png" :
                    asset.endsWith(".svg") ? "image/svg+xml" :
                    asset.endsWith(".webmanifest") ? "application/manifest+json" : "application/octet-stream";
                try {
                    InputStream in = getAssets().open(asset);
                    return new WebResourceResponse(mime, "UTF-8", in);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new java.io.ByteArrayInputStream(new byte[0]));
                }
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                return !"https".equals(uri.getScheme()) || !LOCAL_HOST.equals(uri.getHost());
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent select = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                select.addCategory(Intent.CATEGORY_OPENABLE);
                select.setType("application/json");
                try { startActivityForResult(select, REQUEST_IMPORT); }
                catch (Exception e) { fileCallback.onReceiveValue(null); fileCallback = null; toast("Dateiauswahl nicht möglich"); }
                return true;
            }
        });
        // This is a locally served HTTPS-like origin, with all assets bundled in the APK.
        // No INTERNET permission is requested; private content never leaves the device.
        webView.loadUrl("https://" + LOCAL_HOST + "/assets/index.html");
    }

    private final class BackupBridge {
        @JavascriptInterface
        public void saveBackup(String json) {
            if (json == null || json.length() > 2_000_000) return;
            runOnUiThread(() -> {
                pendingBackup = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, "Klar-Backup.json");
                try { startActivityForResult(intent, REQUEST_EXPORT); }
                catch (Exception e) { pendingBackup = null; toast("Speichern nicht möglich"); }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_IMPORT) {
            if (fileCallback != null) {
                Uri uri = resultCode == RESULT_OK && data != null ? data.getData() : null;
                fileCallback.onReceiveValue(uri == null ? null : new Uri[]{uri});
                fileCallback = null;
            }
        } else if (requestCode == REQUEST_EXPORT) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingBackup != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out == null) throw new IOException("Missing output stream");
                    out.write(pendingBackup.getBytes(StandardCharsets.UTF_8));
                    toast("Backup gespeichert");
                } catch (Exception e) {
                    toast("Backup konnte nicht gespeichert werden");
                }
            }
            pendingBackup = null;
        }
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("KlarNative");
            webView.destroy();
        }
        super.onDestroy();
    }
}
