// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitExtension, Repository } from './api/git'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate (context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('git-files-paths.copyPaths', async (uri?) => {
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
	const changes = await repository.diffWithHEAD()
	// Also get staged changes
	const stagedChanges = await repository.diffIndexWithHEAD()
	// Combine changes and staged changes
	changes.push(...stagedChanges)
	// Get paths
	const paths = changes.map(change => change.uri.path)
	// Remove repo root path
	.map(path => path.replace(repository.rootUri.path, ''))
	// Remove leading slash
	.map(path => path.replace(/^\//, ''))
	// Remove duplicate paths
	.filter((path, index, self) => self.indexOf(path) === index)

	return paths
}

function getGitExtension () {
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git')
  const gitExtension = vscodeGit && vscodeGit.exports
  return gitExtension && gitExtension.getAPI(1)
}

// This method is called when your extension is deactivated
export function deactivate() {}
