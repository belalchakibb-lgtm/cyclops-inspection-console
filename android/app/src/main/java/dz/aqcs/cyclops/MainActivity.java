package dz.aqcs.cyclops;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * CYCLOPS for Android: opens the CYCLOPS web app full screen and adds what a
 * plain WebView lacks — voice-over (Android text-to-speech), photo picking,
 * saving exported files to Downloads, and the back button.
 */
public class MainActivity extends Activity {
    static final String HOME = "https://cyclopsaqcs.onrender.com/";
    static final String HOST = "cyclopsaqcs.onrender.com";
    static final int FILE_REQUEST = 41;
    static final int CHUNK = 3000;

    WebView web;
    ValueCallback<Uri[]> fileCallback;
    TextToSpeech tts;
    volatile boolean ttsReady = false;
    volatile String voiceLangs = "";   // languages the phone can really speak, e.g. "en-US,fr-FR"
    WebView printView;                 // kept alive until the print job has read it
    String extrasJs = "";              // assets/cyclops-extras.js: print, reports, tapped downloads
    boolean onErrorPage = false;
    boolean clearAfterRetry = false;

    /** Injected into every page: speechSynthesis on top of Android TTS, and blob downloads. */
    static final String BRIDGE_JS =
        "(function(){if(window.__cyAndroid||!window.CyAndroid)return;window.__cyAndroid=1;var B=window.CyAndroid;" +
        "var map={},n=0,ls={};" +
        "function U(t){this.text=t||'';this.lang='';this.rate=1;this.pitch=1;this.volume=1;this.voice=null;" +
        "this.onstart=null;this.onend=null;this.onerror=null;this.onboundary=null;this._l={};}" +
        "U.prototype.addEventListener=function(t,f){(this._l[t]=this._l[t]||[]).push(f)};" +
        "U.prototype.removeEventListener=function(t,f){var a=this._l[t]||[],i=a.indexOf(f);if(i>=0)a.splice(i,1)};" +
        "function fire(u,t,err){var e={type:t,utterance:u,error:err,charIndex:0,elapsedTime:0};" +
        "try{if(u['on'+t])u['on'+t](e)}catch(x){console.error(x)}" +
        "(u._l[t]||[]).slice().forEach(function(f){try{f(e)}catch(x){console.error(x)}})}" +
        "var V=[{name:'Android français',lang:'fr-FR',localService:true,'default':false,voiceURI:'android-fr'}," +
        "{name:'Android English',lang:'en-US',localService:true,'default':true,voiceURI:'android-en'}];" +
        "var S={speaking:false,pending:false,paused:false,onvoiceschanged:null," +
        "getVoices:function(){return V.slice()}," +
        "speak:function(u){var id='u'+(++n);map[id]=u;S.speaking=true;" +
        "var lang=u.lang||(u.voice&&u.voice.lang)||document.documentElement.lang||'en-US';" +
        "B.speak(id,String(u.text||''),String(lang),Number(u.rate)||1,Number(u.pitch)||1)}," +
        "cancel:function(){var old=map;map={};S.speaking=false;B.stop();" +
        "Object.keys(old).forEach(function(k){setTimeout(function(){fire(old[k],'error','interrupted')},0)})}," +
        "pause:function(){},resume:function(){}," +
        "addEventListener:function(t,f){(ls[t]=ls[t]||[]).push(f)}," +
        "removeEventListener:function(t,f){var a=ls[t]||[],i=a.indexOf(f);if(i>=0)a.splice(i,1)}," +
        "dispatchEvent:function(){return true}};" +
        "window.__cyTTS=function(id,t){var u=map[id];if(!u)return;if(t==='start'){fire(u,'start');return}" +
        "delete map[id];if(!Object.keys(map).length)S.speaking=false;" +
        "if(t==='end')fire(u,'end');else fire(u,'error','synthesis-failed')};" +
        "try{Object.defineProperty(window,'speechSynthesis',{value:S,configurable:true,writable:true})}catch(e){}" +
        "window.SpeechSynthesisUtterance=U;" +
        "var oc=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){" +
        "var h=this.href||'';if(this.hasAttribute('download')&&(h.indexOf('blob:')===0||h.indexOf('data:')===0)){" +
        "var name=this.getAttribute('download')||'cyclops-file';" +
        "fetch(h).then(function(r){return r.blob()}).then(function(b){var fr=new FileReader();" +
        "fr.onload=function(){var s=String(fr.result);B.saveFile(name,b.type||'application/octet-stream',s.slice(s.indexOf(',')+1))};" +
        "fr.readAsDataURL(b)}).catch(function(e){console.error(e)});return}" +
        "return oc.apply(this,arguments)};" +
        "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        extrasJs = readAsset("cyclops-extras.js");
        int navy = Color.parseColor("#081126");
        getWindow().setStatusBarColor(navy);
        getWindow().setNavigationBarColor(navy);

        web = new WebView(this);
        web.setBackgroundColor(navy);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setTextZoom(100);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setUserAgentString(s.getUserAgentString() + " CYCLOPS-Android");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(web, true);

        setupSpeech();
        web.addJavascriptInterface(new Bridge(), "CyAndroid");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (HOST.equalsIgnoreCase(uri.getHost())) return false;
                openOutside(uri);
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                if (url != null && url.startsWith(HOME)) {
                    if (onErrorPage) { onErrorPage = false; clearAfterRetry = true; }
                    inject(view);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (url != null && url.startsWith(HOME)) {
                    inject(view);
                    if (clearAfterRetry && !onErrorPage) { view.clearHistory(); clearAfterRetry = false; } // Back must not return to the error screen
                }
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline(view);
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 500) showOffline(view);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent intent = params.createIntent();
                    if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) {
                        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    }
                    startActivityForResult(intent, FILE_REQUEST);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        web.setDownloadListener((url, userAgent, contentDisposition, mimeType, length) -> {
            if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) openOutside(Uri.parse(url));
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(HOME);
    }

    void setupSpeech() {
        tts = new TextToSpeech(this, status -> {
            ttsReady = status == TextToSpeech.SUCCESS;
            if (!ttsReady) return;
            StringBuilder langs = new StringBuilder();
            if (tts.isLanguageAvailable(Locale.US) >= TextToSpeech.LANG_AVAILABLE) langs.append("en-US");
            if (tts.isLanguageAvailable(Locale.FRANCE) >= TextToSpeech.LANG_AVAILABLE) langs.append(langs.length() > 0 ? ",fr-FR" : "fr-FR");
            voiceLangs = langs.toString();
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { if (part(id) == 0) callJs(base(id), "start"); }
            @Override public void onDone(String id) { if (part(id) == count(id) - 1) callJs(base(id), "end"); }
            @Override public void onError(String id) { callJs(base(id), "error"); }
            @Override public void onError(String id, int code) { callJs(base(id), "error"); }
            @Override public void onStop(String id, boolean interrupted) { /* cancel is reported by the page itself */ }
        });
    }

    // Utterance ids look like "u7#2/5": page id, chunk index, chunk count.
    static String base(String id) { int i = id.indexOf('#'); return i < 0 ? id : id.substring(0, i); }
    static int part(String id) {
        try { return Integer.parseInt(id.substring(id.indexOf('#') + 1, id.indexOf('/'))); } catch (Exception e) { return 0; }
    }
    static int count(String id) {
        try { return Integer.parseInt(id.substring(id.indexOf('/') + 1)); } catch (Exception e) { return 1; }
    }

    void callJs(String id, String event) {
        String code = "window.__cyTTS&&window.__cyTTS(" + JSONObject.quote(id) + "," + JSONObject.quote(event) + ")";
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    static List<String> chunks(String text) {
        List<String> out = new ArrayList<>();
        String rest = text.trim();
        while (rest.length() > CHUNK) {
            int cut = Math.max(rest.lastIndexOf(". ", CHUNK), rest.lastIndexOf(' ', CHUNK));
            if (cut < CHUNK / 2) cut = CHUNK;
            out.add(rest.substring(0, cut + 1));
            rest = rest.substring(cut + 1).trim();
        }
        if (!rest.isEmpty() || out.isEmpty()) out.add(rest);
        return out;
    }

    class Bridge {
        @JavascriptInterface
        public void speak(String id, String text, String lang, float rate, float pitch) {
            if (tts == null || !ttsReady) { callJs(id, "error"); return; }
            Locale locale = Locale.forLanguageTag(lang == null ? "en-US" : lang);
            int result = tts.setLanguage(locale);
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(new Locale(locale.getLanguage()));
            }
            tts.setSpeechRate(Math.max(0.3f, Math.min(rate, 3f)));
            tts.setPitch(Math.max(0.3f, Math.min(pitch, 2f)));
            List<String> parts = chunks(text == null ? "" : text);
            for (int i = 0; i < parts.size(); i++) {
                tts.speak(parts.get(i), TextToSpeech.QUEUE_ADD, null, id + "#" + i + "/" + parts.size());
            }
        }

        @JavascriptInterface
        public void stop() { if (tts != null) tts.stop(); }

        @JavascriptInterface
        public String voiceLangs() { return voiceLangs; }

        @JavascriptInterface
        public void printPage() { runOnUiThread(() -> print(web)); }

        @JavascriptInterface
        public void printHtml(String html) {
            runOnUiThread(() -> {
                printView = new WebView(MainActivity.this);
                printView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) { print(view); }
                });
                printView.loadDataWithBaseURL(HOME, html, "text/html", "utf-8", null);
            });
        }

        @JavascriptInterface
        public void openLink(String url) {
            Uri uri = Uri.parse(url);
            runOnUiThread(() -> {
                if (HOST.equalsIgnoreCase(uri.getHost())) web.loadUrl(url);
                else openOutside(uri);
            });
        }

        @JavascriptInterface
        public void saveFile(String name, String mime, String base64) {
            String safe = (name == null || name.isEmpty() ? "cyclops-file" : name).replaceAll("[\\\\/:*?\"<>|]+", "_");
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/CYCLOPS");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) throw new IllegalStateException("no uri");
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) { os.write(data); }
                    toast("Saved in Downloads/CYCLOPS: " + safe);
                } else {
                    File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    File file = new File(dir, safe);
                    try (FileOutputStream os = new FileOutputStream(file)) { os.write(data); }
                    toast("Saved: " + file.getAbsolutePath());
                }
            } catch (Exception e) {
                toast("Could not save the file.");
            }
        }
    }

    void toast(String message) { runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_LONG).show()); }

    void openOutside(Uri uri) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
    }

    void inject(WebView view) {
        view.evaluateJavascript(BRIDGE_JS, null);
        view.evaluateJavascript(extrasJs, null);
    }

    void print(WebView view) {
        PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
        if (pm != null) pm.print("CYCLOPS", view.createPrintDocumentAdapter("CYCLOPS"), new PrintAttributes.Builder().build());
    }

    String readAsset(String name) {
        try (InputStream in = getAssets().open(name); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "";
        }
    }

    void showOffline(WebView view) {
        onErrorPage = true;
        String html = "<html><head><meta name=viewport content='width=device-width,initial-scale=1'></head>" +
            "<body style='background:#081126;color:#e6ecff;font-family:sans-serif;text-align:center;padding:60px 24px'>" +
            "<h2>CYCLOPS</h2><p>Connexion au serveur en cours…<br>Connecting to the server…</p>" +
            "<p style='opacity:.7'>Le serveur gratuit peut mettre une minute à se réveiller. Vérifiez Internet. Nouvel essai automatique.<br>" +
            "The free server can take a minute to wake up. Check the internet connection. Retrying automatically.</p>" +
            "<button onclick=\"location.href='" + HOME + "'\" style='margin-top:20px;padding:14px 28px;font-size:16px;" +
            "border-radius:10px;border:0;background:#3b82f6;color:#fff'>Réessayer / Retry</button>" +
            "<script>setTimeout(function(){location.href='" + HOME + "'},20000)</script></body></html>";
        view.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_REQUEST || fileCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                result = new Uri[n];
                for (int i = 0; i < n; i++) result[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
        }
        fileCallback.onReceiveValue(result);
        fileCallback = null;
    }

    @Override
    public void onBackPressed() {
        if (web == null) { finish(); return; }
        // Back closes an open CYCLOPS window first, then goes back, then leaves the app.
        web.evaluateJavascript("(function(){var l=document.querySelectorAll('dialog[open]');if(l.length){l[l.length-1].close();return 1}return 0})()", result -> {
            if ("1".equals(result)) return;
            if (web.canGoBack() && !onErrorPage) web.goBack();
            else finish();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (web != null) web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
        if (tts != null) tts.stop();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
