package expo.modules.smsreader

import android.Manifest
import android.content.BroadcastReceiver
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.Telephony
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

private class RequestPermissionsWrapper(
  private val delegate: ActivityResultContracts.RequestMultiplePermissions
) : AppContextActivityResultContract<Array<String>, Map<String, Boolean>> {
  override fun createIntent(context: Context, input: Array<String>): Intent {
    return delegate.createIntent(context, input)
  }
  override fun parseResult(input: Array<String>, resultCode: Int, intent: Intent?): Map<String, Boolean> {
    return delegate.parseResult(resultCode, intent)
  }
}

class SmsReaderModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context not available")

  private var smsReceiver: BroadcastReceiver? = null
  private var monitoring = false
  private var pendingPermissionPromise: Promise? = null
  private var permissionLauncher: expo.modules.kotlin.activityresult.AppContextActivityResultLauncher<Array<String>, Map<String, Boolean>>? = null

  private fun isFinancialSms(body: String): Boolean {
    val lower = body.lowercase()
    if (lower.contains("otp") || lower.contains("one-time password") || lower.contains("verification code")) return false
    val hasAmount = Regex("(?:rs\\.?\\s*|inr\\s*|₹)\\s*[\\d,]").containsMatchIn(lower)
    val hasWord = Regex("debited|debit|credited|credit|spent|paid|purchase|payment|withdrawn|deposited|received|sent|transferred|deducted|upi|vpa").containsMatchIn(lower)
    return hasAmount && hasWord
  }

  private fun registerSmsReceiver() {
    if (smsReceiver != null) return
    smsReceiver = object : BroadcastReceiver() {
      override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        for (msg in messages) {
          val body = msg.displayMessageBody ?: msg.messageBody ?: ""
          val sender = msg.displayOriginatingAddress ?: msg.originatingAddress ?: ""
          if (body.isBlank()) continue
          if (isFinancialSms(body)) {
            sendEvent(
              "onSmsReceived",
              mapOf(
                "body" to body,
                "sender" to sender,
                "timestamp" to System.currentTimeMillis()
              )
            )
          }
        }
      }
    }
    val filter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
    if (Build.VERSION.SDK_INT >= 33) {
      ContextCompat.registerReceiver(context, smsReceiver, filter, ContextCompat.RECEIVER_EXPORTED)
    } else {
      context.registerReceiver(smsReceiver, filter)
    }
  }

  private fun unregisterSmsReceiver() {
    smsReceiver?.let {
      try {
        context.unregisterReceiver(it)
      } catch (_: IllegalArgumentException) {
        // already unregistered
      }
    }
    smsReceiver = null
  }

  override fun definition() = ModuleDefinition {
    Name("SmsReader")

    Events("onSmsReceived")

    RegisterActivityContracts {
      permissionLauncher = registerForActivityResult(
        RequestPermissionsWrapper(ActivityResultContracts.RequestMultiplePermissions())
      )
    }

    OnStartObserving("onSmsReceived") {
      if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED) {
        registerSmsReceiver()
      }
    }

    OnStopObserving("onSmsReceived") {
      unregisterSmsReceiver()
    }

    AsyncFunction("checkPermission") {
      val readGranted = ContextCompat.checkSelfPermission(
        context, Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
      val receiveGranted = ContextCompat.checkSelfPermission(
        context, Manifest.permission.RECEIVE_SMS
      ) == PackageManager.PERMISSION_GRANTED
      mapOf(
        "granted" to (readGranted && receiveGranted),
        "canRequest" to true
      )
    }

    AsyncFunction("requestPermission") { promise: Promise ->
      val readGranted = ContextCompat.checkSelfPermission(
        context, Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
      val receiveGranted = ContextCompat.checkSelfPermission(
        context, Manifest.permission.RECEIVE_SMS
      ) == PackageManager.PERMISSION_GRANTED

      if (readGranted && receiveGranted) {
        promise.resolve(true)
        return@AsyncFunction
      }

      val launcher = permissionLauncher
      if (launcher == null) {
        promise.resolve(false)
        return@AsyncFunction
      }

      pendingPermissionPromise = promise
      launcher.launch(arrayOf(Manifest.permission.READ_SMS, Manifest.permission.RECEIVE_SMS)) { permissions ->
        val allGranted = permissions.values.all { it }
        if (pendingPermissionPromise != null) {
          pendingPermissionPromise?.resolve(allGranted)
          pendingPermissionPromise = null
        }
      }
    }

    AsyncFunction("startMonitoring") {
      val hasPermission = ContextCompat.checkSelfPermission(
        context, Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
      if (!hasPermission) {
        monitoring = false
        return@AsyncFunction false
      }
      registerSmsReceiver()
      monitoring = true
      true
    }

    AsyncFunction("stopMonitoring") {
      unregisterSmsReceiver()
      monitoring = false
      true
    }

    Function("isMonitoring") {
      monitoring
    }

    AsyncFunction("readSms") { options: Map<String, Any> ->
      val hasPermission = ContextCompat.checkSelfPermission(
        context, Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED

      if (!hasPermission) {
        throw SecurityException("READ_SMS permission not granted")
      }

      val maxCount = (options["maxCount"] as? Double)?.toInt() ?: 100
      val filterKeywords = (options["filter"] as? List<*>)?.map { it.toString().lowercase() } ?: emptyList()

      val smsList = mutableListOf<Map<String, Any>>()
      val contentResolver: ContentResolver = context.contentResolver
      val uri: Uri = Telephony.Sms.Inbox.CONTENT_URI

      val projection = arrayOf(
        Telephony.Sms.BODY,
        Telephony.Sms.ADDRESS,
        Telephony.Sms.DATE
      )

      val sortOrder = "${Telephony.Sms.DATE} DESC"

      val cursor: Cursor? = contentResolver.query(
        uri, projection, null, null, sortOrder
      )

      cursor?.use { c ->
        val bodyIndex = c.getColumnIndex(Telephony.Sms.BODY)
        val addressIndex = c.getColumnIndex(Telephony.Sms.ADDRESS)
        val dateIndex = c.getColumnIndex(Telephony.Sms.DATE)

        var count = 0
        while (c.moveToNext() && count < maxCount) {
          val body = if (bodyIndex >= 0) c.getString(bodyIndex) ?: "" else ""
          val sender = if (addressIndex >= 0) c.getString(addressIndex) ?: "" else ""

          val shouldInclude = filterKeywords.isEmpty() ||
            filterKeywords.any { keyword ->
              body.lowercase().contains(keyword) || sender.lowercase().contains(keyword)
            }

          if (shouldInclude && body.isNotBlank()) {
            smsList.add(
              mapOf(
                "body" to body,
                "sender" to sender
              )
            )
            count++
          }
        }
      }

      smsList
    }

    AsyncFunction("getScanProgress") {
      mapOf("step" to "preparing", "progress" to 1.0)
    }
  }
}
