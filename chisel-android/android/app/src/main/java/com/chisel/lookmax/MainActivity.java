package com.chisel.lookmax;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final long CHISEL_LABS_BOOT_DELAY_MS = 900L;

    private static final String CHISEL_LABS_INJECTION =
        "(function(){" +
        "if(window.__chiselLabsNativeInjected){return;}" +
        "window.__chiselLabsNativeInjected=true;" +
        "var host=document.head||document.documentElement;" +
        "function fail(){window.__chiselLabsNativeInjected=false;}" +
        "function css(src){if(document.querySelector('link[data-chisel-labs]'))return;" +
        "var l=document.createElement('link');l.rel='stylesheet';l.href=src;l.setAttribute('data-chisel-labs','css');host.appendChild(l);}" +
        "function js(src,done){var existing=document.querySelector('script[data-chisel-labs=\\\"'+src+'\\\"]');" +
        "if(existing){if(done)done();return;}var s=document.createElement('script');s.src=src;" +
        "s.setAttribute('data-chisel-labs',src);s.onload=function(){if(done)done();};s.onerror=fail;host.appendChild(s);}" +
        "css('chisel-enhancements.css?v=20260801');" +
        "js('chisel-enhancements-core.js?v=20260801',function(){js('chisel-enhancements.js?v=20260801');});" +
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
