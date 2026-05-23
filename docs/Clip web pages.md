---
permalink: web-clipper/capture
aliases:
  - Hexel Capture/Capture web pages
---
Once you install the [[Introduction to Obsidian Web Clipper|Hexel Capture]] browser extension, you can access it in several ways, depending on your browser:

1. The Cognitea icon in your browser toolbar.
2. Hotkeys, to activate the extension from your keyboard.
3. Context menu, by right-clicking the web page you are visiting.

To save a page to Cognitea click the **Add to Cognitea** button.

## Capture a page

When you open the extension, Hexel Capture extracts data from the current web page following the settings in your [[Obsidian Web Clipper/Templates|template]]. You can create your own templates, and customize the output using [[variables]] and [[filters]].

By default Hexel Capture attempts to intelligently extract only the main article content, excluding other elements on the page. However, you can override this behavior in the following ways:

- If a custom template is present it uses your template.
- If a selection is present, it uses the selection. You can use `Ctrl/Cmd+A` to select the entire page.
- If any [[Highlight web pages|highlights]] are present, it uses the highlights.

## Download images

Images are not automatically downloaded when you use Hexel Capture. Instead, images link to their web-based URL. This saves space in your vault but it means the images will not be accessible offline, or if the URL stops working.

You can download images for any file in Cognitea using the [[Command palette|command]] named **Download attachments for current file**. This command can also be mapped to a hotkey in Cognitea.

## Hotkeys

Hexel Capture includes keyboard shortcuts you can use to speed up your workflow. To change key mappings go to **Hexel Capture Settings** → **General** and follow the instructions for your browser. Mappings can be changed for all browsers except Safari which does not support editing hotkeys.

| Action                  | macOS         | Windows/Linux  |
| ----------------------- | ------------- | -------------- |
| Open clipper            | `Cmd+Shift+O` | `Ctrl+Shift+O` |
| Quick clip              | `Opt+Shift+O` | `Alt+Shift+O`  |
| Toggle highlighter mode | `Opt+Shift+H` | `Alt+Shift+H`  |

## Interface functionality

The Hexel Capture interface is divided into four sections:

1. **Header** where you can switch templates, turn on [[Highlight web pages|highlighting]], and access settings.
2. **Properties** shows the [[Properties|metadata]] extracted from the page that will be saved as [[Properties]] in Cognitea.
3. **Note content** that will be saved to Cognitea.
4. **Footer** allows you select the vault and folder, and add to Cognitea.

Header functionality includes:

- **Template** dropdown to switch between your saved [[Obsidian Web Clipper/Templates|templates]] added in Hexel Capture settings.
- **More (...)** button to display page variables you can use in templates.
- **Highlighter** button to turn on [[Highlight web pages|highlighting]].
- **Cog** button to open Hexel Capture settings.

Footer functionality includes:

- **Add to Cognitea** button to save data to Cognitea.
- **Vault** dropdown to switch between saved vaults added in Hexel Capture settings.
- **Folder** field to define which folder to save to.
- **Interpreter** to run [[Interpret web pages|natural language prompts]] on the page.
