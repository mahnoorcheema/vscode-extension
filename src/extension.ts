// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const getFileType = (uri:string):string => {
	const extensionIndex = uri.lastIndexOf('.');
	if (!extensionIndex || extensionIndex === -1)
		console.error("Invalid file uri")
	return uri?.substr(extensionIndex + 1, uri.length - extensionIndex)
}

const getRangeOfEntireDocument = (document: vscode.TextDocument): vscode.Range => {
	const firstLine = document.lineAt(0)
	const lastLine = document.lineAt(document.lineCount - 1)
	return new vscode.Range(firstLine.range.start, lastLine.range.end)
}

const extractClassNames = (htmlText: string):string[] => {
	const regexExpression = /class="(.*?)"/gm
	const classNames = [...htmlText.matchAll(regexExpression)].map(([,match,]) =>match );
	return classNames;
}

const getAllClassNames = (document: vscode.TextDocument): string[] => {
	const textRange = getRangeOfEntireDocument(document);
	const htmlText = document.getText(textRange)
	return extractClassNames(htmlText)
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "hello-world" is now active!');
	let disposable = vscode.commands.registerCommand('hello-world.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello VSCODE!');
		const workspace = vscode.workspace;
		const editor = vscode.window.activeTextEditor; 
		if (!workspace) 
			vscode.window.showErrorMessage("Cannot find an opened workspace");
		if (!editor) 
			vscode.window.showErrorMessage("Cannot find any actively open html files");
	
		const fileTypeOfActiveTextEditor = editor?.document.fileName ? getFileType(editor?.document.fileName) : "";

		if (fileTypeOfActiveTextEditor !== "html") 
			vscode.window.showErrorMessage("An html file needs to be open")
		
		const folder = workspace.workspaceFolders?.[0];

		if (!folder) {
			vscode.window.showErrorMessage("There is no folder open")
		}

		const document = editor?.document;
		const selection = editor?.selection;

		//should this be a switch case instead?
		const cssClasses = selection?.isEmpty && document ? getAllClassNames(document) : [document?.getText(selection)]
		const globPatternForCssFile = folder && new vscode.RelativePattern(folder, '*.css');
		const allCssFilesInFolder = globPatternForCssFile ? await workspace.findFiles(globPatternForCssFile) : [];
		const cssFile = await workspace.openTextDocument(allCssFilesInFolder?.[0]);
		const lastLineOfCssFile = cssFile.lineAt(cssFile.lineCount - 1);

		
		const formattedClassNamesForCssfile = cssClasses.map(classname => `.${classname} {}`).join('\n')
		const edits = [new vscode.TextEdit(lastLineOfCssFile.range, formattedClassNamesForCssfile)]
		const workEdits = new vscode.WorkspaceEdit();
		workEdits.set(cssFile.uri, edits)
		vscode.workspace.applyEdit(workEdits);
		// vscode.window.showTextDocument(cssFile) //not sure if i want this yet
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
