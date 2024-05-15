# Git Copy Files Paths

## Features
Button to run `Git Copy Files Paths` command and demo:

![Use button](images/git-paths-button.gif)

## Usage

- Open the Command Palette `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS)
- Type `Git Copy Files Paths` and hit `return`
- The paths for the modified/added files are copied in the clipboard

## Extension Settings

This extension contributes the following settings:

* `gitPaths.includeNonStagedChanges`: Include non staged changes. Default is `true`.
* `gitPaths.includeStagedChanges`: Include staged changes. Default is `true`.
  > NB: If includeNonStagedChanges and includeStagedChanges are set to `false` they will both be included.

* `gitPaths.removeRepoRootPath`: Remove the repository root path from the file path. This will lead to relative paths. Default is `true`.
* `gitPaths.removeLeadingSlash`: Remove the leading slash from the file path. Default is `true`.
* `gitPaths.removeDuplicates`: Remove duplicate paths. Default is `true`.

**Happy Copying!**
