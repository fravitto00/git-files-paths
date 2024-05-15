// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitExtension, Repository, Change } from './api/git'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate (context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('gitPaths.copyPaths', async (uri?) => {
    const git = getGitExtension()

    if (!git) {
      vscode.window.showErrorMessage('Unable to load Git Extension')
      return
    }

    vscode.commands.executeCommand('workbench.view.scm')

    if (uri) {
      const selectedRepository = git.repositories.find(repository => {
        return repository.rootUri.path === uri.rootUri.path
      })

	  console.log('selectedRepository', selectedRepository)

      if (selectedRepository) {
		const paths = await buildPaths(selectedRepository)
		const pathsString = paths.join(' ')
		vscode.env.clipboard.writeText(pathsString)
      }
    } else {
      for (const repo of git.repositories) {
        const paths = await buildPaths(repo)
		const pathsString = paths.join(' ')
		// Append to clipboard
		vscode.env.clipboard.writeText(vscode.env.clipboard.readText() + pathsString)
      }
    }
  })

  context.subscriptions.push(disposable)
}

async function buildPaths (repository: Repository) {
	const { includeNonStagedChanges, includeStagedChanges, removeRepoRootPath, removeLeadingSlash, removeDuplicates } = vscode.workspace.getConfiguration('gitPaths')
	let changes: Change[] = []

	// Get non staged changes
	if (includeNonStagedChanges || !includeNonStagedChanges && !includeStagedChanges) {
		changes = await repository.diffWithHEAD()
	}

	// Get staged changes
	if (includeStagedChanges || !includeNonStagedChanges && !includeStagedChanges) {
		const stagedChanges = await repository.diffIndexWithHEAD()
		// Combine changes (or empty array) and staged changes
		changes.push(...stagedChanges)
	}

	// Get paths
	let paths = changes.map(change => change.uri.path)

	// Remove repo root path
	if (removeRepoRootPath) {
		paths = paths.map(path => path.replace(repository.rootUri.path, ''))
	}

	// Remove leading slash
	if (removeLeadingSlash) {
		paths = paths.map(path => path.replace(/^\//, ''))
	}

	// Remove duplicate paths
	if (removeDuplicates) {
		paths = paths.filter((path, index, self) => self.indexOf(path) === index)
	}

	return paths
}

function getGitExtension () {
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git')
  const gitExtension = vscodeGit && vscodeGit.exports
  return gitExtension && gitExtension.getAPI(1)
}

// This method is called when your extension is deactivated
export function deactivate() {}
