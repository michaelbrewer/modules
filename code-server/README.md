---
display_name: code-server
description: VS Code in the browser
icon: ../.icons/code.svg
maintainer_github: coder
verified: true
tags: [helper, ide]
---

# code-server

Automatically install [code-server](https://github.com/coder/code-server) in a workspace, create an app to access it via the dashboard, install extensions, and pre-configure editor settings.

![Screenshot 1](https://github.com/coder/code-server/raw/main/docs/assets/screenshot-1.png?raw=true)
![Screenshot 2](https://github.com/coder/code-server/raw/main/docs/assets/screenshot-2.png?raw=true)

## Highlights

- Code on any device with a consistent development environment
- Use cloud servers to speed up tests, compilations, downloads, and more
- Preserve battery life when you're on the go; all intensive tasks run on your
  server

## Examples

### Pre-install Extensions

Install the Dracula theme from [OpenVSX](https://open-vsx.org/):

```hcl
module "code-server" {
    source = "https://registry.coder.com/modules/code-server"
    extensions = [
        "dracula-theme.theme-dracula"
    ]
}
```

Enter the `<author>.<name>` into the extensions array and code-server will automatically install on start.

### Pre-configure Settings

Configure VS Code's [settings.json](https://code.visualstudio.com/docs/getstarted/settings#_settingsjson) file:

```hcl
module "settings" {
    source = "https://registry.coder.com/modules/code-server"
    extensions = [ "dracula-theme.theme-dracula" ]
    settings = {
        "workbench.colorTheme" = "Dracula"
    }
}
```

### Offline Mode

Just run code-server in the background, don't fetch it from GitHub:

```hcl
module "settings" {
    source = "https://registry.coder.com/modules/code-server"
    offline = true
}
```