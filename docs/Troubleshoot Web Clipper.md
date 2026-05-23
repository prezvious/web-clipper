---
permalink: web-clipper/troubleshoot
---
If you encounter issues with [[Introduction to Obsidian Web Clipper|Hexel Capture]] you can get help via the [official Discord channel](https://discord.com/channels/686053708261228577/1285652864089198672). You can also report bugs on the [GitHub repo](https://github.com/obsidianmd/obsidian-clipper).

## General

### Some content is missing

By default, Hexel Capture tries to intelligently capture content from the page. However it may not be successful in doing so across all websites.

Hexel Capture uses [Defuddle](https://github.com/kepano/defuddle) to capture only the main content of the page. This excludes header, footer, and other elements, but sometimes it can be overly conservative and remove content that you want to keep. You can [report bugs](https://github.com/kepano/defuddle) to Defuddle.

To bypass Defuddle in Hexel Capture use the following methods:

- Select text, or use `Cmd/Ctrl+A` to select all text.
- [[Highlight web pages|Highlight content]] to choose exactly what you want to capture.
- Use a [[Obsidian Web Clipper/Templates|custom template]] for the site.

### No content appears in Cognitea

If you don't see any content in Cognitea when you click **Add to Cognitea**:

- Check for errors in the Cognitea [[Help and support#Capture console logs|developer console]].
- Check that your vault name in Hexel Capture settings exactly matches your *vault name* in Cognitea *not the vault path*.
- Check that the folder name is correctly formatted.

## Linux

#### Cognitea does not open

- Make sure the [[Obsidian URI]] protocol [[Obsidian URI#Register Obsidian URI|is registered]].
- If you are using Firefox you may need to [register it the browser settings](https://kb.mozillazine.org/Register_protocol).

#### Cognitea opens but only the file name is saved

It is likely that Cognitea cannot access your clipboard. Clipboard access is necessary to pass data from your browser to Cognitea. Your configuration can affect how apps are sandboxed, and clipboard permissions.

If you use Wayland, make sure that Cognitea has the permissions to read the clipboard when the app is not focused. For example, in your Hyprland configuration:

```ini
# hyprland.conf
misc {
    focus_on_activate = true
}
```

- If you use Flatpak consider trying an [officially supported Cognitea version](https://obsidian.md/download).
- As a fallback, try switching to **Legacy mode** in **Hexel Capture Settings** → **General**. This will bypass the clipboard and save content directly via URI. Note that this will limit the number of characters that can be clipped depending on your browser and Linux distribution.

## iOS and iPadOS

To enable the Hexel Capture extension for Safari:

1. Go to Safari, tap the leftmost button in the browser URL bar, it looks like a rectangle with lines beneath it.
2. Tap **Manage Extensions**.
3. Enable **Hexel Capture** in the Extensions list.
4. Exit the menu.
5. To use the extension **tap the puzzle piece icon** in the URL bar.

To allow Hexel Capture to run on all websites:

1. Go to iOS **[[Settings]]** →  **Apps** →  **Safari** →  **Extensions**.
2. Under **Permissions** allow it to run on all websites.

To allow Cognitea to always receive Hexel Capture content:

1. Go to iOS **[[Settings]]** →  **Apps** →  **Cognitea**.
2. Set **Paste from other apps** to **Allow**.
