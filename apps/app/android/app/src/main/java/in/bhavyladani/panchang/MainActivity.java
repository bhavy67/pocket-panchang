package in.bhavyladani.panchang;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DeviceHealthPlugin.class);
        super.onCreate(savedInstanceState);
        // The WebView would scale every font, px caps included, by the system font size. The app
        // applies the system scale itself through rem instead (DeviceHealth.fontScale), so the
        // approved ~115% caps on timeline and nav labels hold (docs/design/screens.md).
        getBridge().getWebView().getSettings().setTextZoom(100);
    }
}
