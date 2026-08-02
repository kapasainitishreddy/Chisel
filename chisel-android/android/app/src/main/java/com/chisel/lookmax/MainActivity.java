package com.chisel.lookmax;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final long CHISEL_LABS_BOOT_DELAY_MS = 900L;

    private static final String CHISEL_LABS_INJECTION =
        "(function(){" +
        "if(window.__chiselLabsNativeInjected){return;}window.__chiselLabsNativeInjected=true;" +
        "var host=document.head||document.documentElement;function fail(){window.__chiselLabsNativeInjected=false;}" +
        "function css(src){var q='link[data-chisel-asset=\\\"'+src+'\\\"]';if(document.querySelector(q))return;" +
        "var l=document.createElement('link');l.rel='stylesheet';l.href=src;l.setAttribute('data-chisel-asset',src);l.onerror=fail;host.appendChild(l);}" +
        "function js(src,done){var q='script[data-chisel-asset=\\\"'+src+'\\\"]',e=document.querySelector(q);" +
        "if(e){if(done)done();return;}var s=document.createElement('script');s.src=src;s.setAttribute('data-chisel-asset',src);" +
        "s.onload=function(){if(done)done();};s.onerror=fail;host.appendChild(s);}" +
        "css('chisel-enhancements.css?v=20260801');css('chisel-precision.css?v=20260802');" +
        "js('chisel-enhancements-core.js?v=20260801',function(){js('chisel-enhancements.js?v=20260801',function(){" +
        "js('chisel-precision-stats.js?v=20260802',function(){js('chisel-precision-protocol.js?v=20260802',function(){" +
        "js('chisel-precision-core.js?v=20260802',function(){js('chisel-precision-face.js?v=20260802',function(){" +
        "js('chisel-precision-body.js?v=20260802',function(){js('chisel-precision-ui.js?v=20260802',function(){" +
        "js('chisel-precision.js?v=20260802');});});});});});});});});" +
        "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        injectChiselLabs();
    }

    @Override
    protected void onResume() {
        super.onResume();
        injectChiselLabs();
    }

    private void injectChiselLabs() {
        if (getBridge() == null || getBridge().getWebView() == null) return;
        WebView webView = getBridge().getWebView();
        webView.postDelayed(() -> webView.evaluateJavascript(CHISEL_LABS_INJECTION, null), CHISEL_LABS_BOOT_DELAY_MS);
    }
}
