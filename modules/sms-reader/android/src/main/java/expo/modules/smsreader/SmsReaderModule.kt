package expo.modules.smsreader

import android.Manifest
import android.content.ContentResolver
import android.content.Context
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.provider.Telephony
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

data class SmsItem(
  val body: String,
  val sender: String,
  val date: Long
)

class SmsReaderModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context not available")

  override fun definition() = ModuleDefinition {
    Name("SmsReader")

    Function("requestPermission") {
      val hasPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED

      if (hasPermission) {
        return@Function true
      }

      val activity = appContext.currentActivity ?: return@Function false
      val fragment = activity.fragment

      val permissions = arrayOf(Manifest.permission.READ_SMS)
      fragment.requestPermissions(permissions) { _, _ -> }
      false
    }

    AsyncFunction("readSms") { options: Map<String, Any> ->
      val hasPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.READ_SMS
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
