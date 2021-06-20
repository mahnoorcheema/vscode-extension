// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "hello-world" is now active!');
	let disposable = vscode.commands.registerCommand('hello-world.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello VSCODE!');
		const editor = vscode.window.activeTextEditor; //TODO: confirm that active text is a html file
		const workspace = vscode.workspace;
		const folder = workspace.workspaceFolders?.[0];

		if (editor) { //TODO: make these if nots
			const document = editor.document;
			const selection = editor.selection;
			//if no selection, do the whole document
			if (selection.isEmpty) {
				const firstLine = document.lineAt(0)
				const lastLine = document.lineAt(document.lineCount - 1)
				const textRangeForEntireDoc = new vscode.Range(firstLine.range.start, lastLine.range.end)
				const htmlDocText = document.getText(textRangeForEntireDoc);
				const regexExpression = /class="(.*?)"/gm
				const allClassNamesInHtmlDoc = [...htmlDocText.matchAll(regexExpression)].map(([,match,]) =>match );
				console.log(allClassNamesInHtmlDoc)
			}
			

			if (folder && !selection.isEmpty) {
				const cssClassName = document.getText(selection);
				const pattern = new vscode.RelativePattern(folder, '*.css')
				const allCssFilesInWorkspace = await workspace.findFiles(pattern);
				const cssFile = await workspace.openTextDocument(allCssFilesInWorkspace?.[0])
				const lastLineOfCssFile = cssFile.lineAt(cssFile.lineCount - 1);

				const classToAppend = [new vscode.TextEdit(lastLineOfCssFile.range, `.${cssClassName}{}\n`)]
				const workEdits = new vscode.WorkspaceEdit();
				workEdits.set(cssFile.uri, classToAppend)
				vscode.workspace.applyEdit(workEdits);
				vscode.window.showTextDocument(cssFile)
			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
