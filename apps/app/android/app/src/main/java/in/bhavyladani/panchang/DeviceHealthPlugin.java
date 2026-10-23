package in.bhavyladani.panchang;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Notifications health (Phase 11): battery-optimisation status, the phone maker (for
 * Samsung/Xiaomi steps), and shortcuts to the system settings that fix them. Uses the settings
 * list, not ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, which Play restricts.
 */
@CapacitorPlugin(name = "DeviceHealth")
public class DeviceHealthPlugin extends Plugin {

    @PluginMethod
    public void status(PluginCall call) {
        PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
        JSObject result = new JSObject();
        result.put("ignoringBatteryOptimizations", pm != null && pm.isIgnoringBatteryOptimizations(getContext().getPackageName()));
        result.put("manufacturer", Build.MANUFACTURER == null ? "" : Build.MANUFACTURER);
        call.resolve(result);
    }

    /** The system font size (Settings → Display → Font size), e.g. 1.3; applied as rem by the app. */
    @PluginMethod
    public void fontScale(PluginCall call) {
        JSObject result = new JSObject();
        result.put("scale", getContext().getResources().getConfiguration().fontScale);
        call.resolve(result);
    }

    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        open(call, new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
        intent.putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
        open(call, intent);
    }

    private void open(PluginCall call, Intent intent) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Settings screen not available", e);
        }
    }
}
