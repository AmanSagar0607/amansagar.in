# Code block copy feedback

- Reuse the existing article code-copy button; do not add a second copy control or package-manager command block without a matching content use case.
- Copy success and failure are announced through a polite live region and shown on the button.
- If the Clipboard API rejects access, try a selection-based fallback. If that also fails, show an accessible failure state instead of silently logging or interrupting the reader with an alert.
- Existing Markdown and MDX code-fence rendering stays unchanged.
