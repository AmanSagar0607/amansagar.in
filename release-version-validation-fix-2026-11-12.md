# Release Version Validation Fix

The admin Settings page marked the default release version `1.0.0` invalid because the HTML pattern used doubled backslashes. The browser therefore looked for literal backslashes instead of dots between the three numeric version parts.

The pattern now accepts standard semantic versions such as `1.2.3` and lowercase prereleases such as `1.2.3-beta.1`, matching the server-side settings validator. The field also explains the accepted format in its native validation message.
