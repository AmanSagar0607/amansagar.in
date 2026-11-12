# Admin Profile Image Setting

Added a Profile image URL field and direct upload control to Admin → Settings → Profile, with a live preview. Uploads use the authenticated media library and accept JPEG, PNG, WebP, GIF, and AVIF images up to 4 MB. The selected image URL is staged in the form and takes effect on the homepage after saving settings. The homepage hero keeps its existing avatar dimensions and crops images with `object-fit: cover`.

Site-relative image paths and HTTPS URLs are also accepted; blank values fall back to `/aman-avatar.webp`, and non-HTTPS external URLs are rejected.
